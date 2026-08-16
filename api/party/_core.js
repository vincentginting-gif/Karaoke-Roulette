// ─────────────────────────────────────────────────────────────
//  Party-Kernlogik (I/O-frei bis auf den übergebenen `store`).
//
//  Ein Raum besteht aus drei Keys:
//    kr:room:{code}:meta    = { hostSecret, name, songs[], order, noRepeat, createdAt }
//    kr:room:{code}:players = LIST von { id, name, ownerDeviceId }  (RPUSH/LREM = atomar)
//    kr:room:{code}:turn    = { turnIndex, seq, event, drawn[] }
//
//  Der Gewinner wird SERVERSEITIG gezogen (respektiert „schon gesungen"),
//  damit alle Geräte garantiert dasselbe Lied + dieselbe Rarity zeigen.
//  rng/now sind injizierbar → testbar & deterministisch.
// ─────────────────────────────────────────────────────────────

const TTL = 6 * 60 * 60 // 6 h – Räume räumen sich selbst auf
const START_DELAY_MS = 1500 // Vorlauf, damit alle ~synchron starten
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // ohne 0/O/1/I
const MAX_SONGS = 1000
const MAX_PLAYERS = 50
const MAX_NAME = 40

// ── Fehler mit HTTP-Status ──
export function httpError(status, code) {
  const e = new Error(code)
  e.status = status
  e.code = code
  return e
}

// ── Keys ──
const kMeta = (c) => `kr:room:${c}:meta`
const kPlayers = (c) => `kr:room:${c}:players`
const kTurn = (c) => `kr:room:${c}:turn`

// ── Zufalls-Helfer ──
function randStr(len, rng) {
  let s = ''
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(rng() * ALPHABET.length)]
  return s
}

/** Rarity des Gewinners – identische Schwellen wie im Frontend (Gold = 1/10000). */
export function rollRarity(rng) {
  const r = rng()
  if (r < 1 / 10000) return 'gold'
  if (r < 0.05) return 'covert'
  if (r < 0.2) return 'classified'
  if (r < 0.5) return 'restricted'
  return 'milspec'
}

/** Zieht einen Song-Index; meidet bereits gezogene (No-Repeat) und den letzten. */
export function pickWinnerIndex(count, drawn, lastIndex, noRepeat, rng) {
  if (count <= 0) throw httpError(400, 'no_songs')
  if (count === 1) return { index: 0, didReset: false }

  let candidates = []
  for (let i = 0; i < count; i++) candidates.push(i)
  let didReset = false

  if (noRepeat) {
    const drawnSet = new Set(drawn)
    let cand = candidates.filter((i) => !drawnSet.has(i))
    if (cand.length === 0) {
      cand = candidates
      didReset = true
    }
    candidates = cand
  }
  if (lastIndex != null) {
    const withoutLast = candidates.filter((i) => i !== lastIndex)
    if (withoutLast.length > 0) candidates = withoutLast
  }
  const index = candidates[Math.floor(rng() * candidates.length)]
  return { index, didReset }
}

/** Nächster Turn-Index: manuell = der Reihe nach, zufällig = anderer Spieler. */
export function nextTurnIndex(order, turnIndex, n, rng) {
  if (n <= 1) return 0
  if (order === 'random') {
    let i = turnIndex
    // Nicht denselben Spieler direkt noch mal.
    while (i === turnIndex) i = Math.floor(rng() * n)
    return i
  }
  return (turnIndex + 1) % n
}

// ── Interne Lade-Helfer ──
async function loadMeta(store, code) {
  const raw = await store.get(kMeta(code))
  if (!raw) throw httpError(404, 'room_not_found')
  return JSON.parse(raw)
}
async function loadPlayers(store, code) {
  const raw = (await store.lrange(kPlayers(code))) || []
  // raw = Liste von JSON-Strings; parsed + Roh-String (für exaktes LREM) behalten.
  return raw.map((s) => ({ raw: s, ...JSON.parse(s) }))
}
async function loadTurn(store, code) {
  const raw = await store.get(kTurn(code))
  return raw ? JSON.parse(raw) : { turnIndex: 0, seq: 0, event: null, drawn: [] }
}
async function saveTurn(store, code, turn) {
  await store.set(kTurn(code), JSON.stringify(turn), TTL)
}
async function touch(store, code) {
  // TTL aller Keys auffrischen, solange der Raum lebt.
  await Promise.all([
    store.expire(kMeta(code), TTL),
    store.expire(kPlayers(code), TTL),
    store.expire(kTurn(code), TTL),
  ])
}

function publicPlayers(players) {
  return players.map((p) => ({ id: p.id, name: p.name, ownerDeviceId: p.ownerDeviceId }))
}
function publicMeta(meta) {
  return { name: meta.name, songs: meta.songs, order: meta.order, noRepeat: meta.noRepeat }
}

// ── Öffentliche Aktionen ──

/** Neuen Raum anlegen; gibt Code + hostSecret zurück. */
export async function createRoom(store, params, opts = {}) {
  const rng = opts.rng || Math.random
  const now = opts.now || Date.now()
  const songs = Array.isArray(params.songs) ? params.songs.filter((s) => typeof s === 'string' && s.trim()) : []
  if (songs.length === 0) throw httpError(400, 'no_songs')
  if (songs.length > MAX_SONGS) throw httpError(400, 'too_many_songs')
  const deviceId = String(params.deviceId || '').trim()
  if (!deviceId) throw httpError(400, 'no_device')

  // Eindeutigen Code finden.
  let code = ''
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = randStr(6, rng)
    if (!(await store.get(kMeta(candidate)))) {
      code = candidate
      break
    }
  }
  if (!code) throw httpError(500, 'code_collision')

  const hostSecret = randStr(24, rng)
  const meta = {
    hostSecret,
    name: String(params.name || '').slice(0, 60) || 'Party',
    songs,
    order: params.order === 'random' ? 'random' : 'manual',
    noRepeat: params.noRepeat !== false,
    createdAt: now,
  }
  await store.set(kMeta(code), JSON.stringify(meta), TTL)
  await saveTurn(store, code, { turnIndex: 0, seq: 0, event: null, drawn: [] })

  // Anfangsnamen des Gastgeber-Geräts.
  const initial = Array.isArray(params.initialNames) ? params.initialNames : []
  for (const nm of initial) {
    const name = String(nm || '').trim().slice(0, MAX_NAME)
    if (name) await store.rpush(kPlayers(code), JSON.stringify({ id: randStr(10, rng), name, ownerDeviceId: deviceId }))
  }
  await store.expire(kPlayers(code), TTL)

  return { code, hostSecret }
}

/** Vollständigen (öffentlichen) Raum-Zustand lesen. */
export async function getState(store, code) {
  const meta = await loadMeta(store, code)
  const players = await loadPlayers(store, code)
  const turn = await loadTurn(store, code)
  return {
    code,
    meta: publicMeta(meta),
    players: publicPlayers(players),
    turnIndex: turn.turnIndex,
    seq: turn.seq,
    event: turn.event,
    drawnCount: (turn.drawn || []).length,
  }
}

/** Spieler (Name) hinzufügen – gehört dem eintragenden Gerät. */
export async function addPlayer(store, params) {
  const code = params.code
  await loadMeta(store, code) // existiert?
  const name = String(params.name || '').trim().slice(0, MAX_NAME)
  const deviceId = String(params.deviceId || '').trim()
  if (!name) throw httpError(400, 'no_name')
  if (!deviceId) throw httpError(400, 'no_device')
  const players = await loadPlayers(store, code)
  if (players.length >= MAX_PLAYERS) throw httpError(400, 'too_many_players')
  const rng = Math.random
  await store.rpush(kPlayers(code), JSON.stringify({ id: randStr(10, rng), name, ownerDeviceId: deviceId }))
  await touch(store, code)
  return getState(store, code)
}

/** Spieler entfernen – nur das eigene Gerät (oder der Gastgeber). */
export async function removePlayer(store, params) {
  const code = params.code
  const meta = await loadMeta(store, code)
  const deviceId = String(params.deviceId || '').trim()
  const isHost = params.hostSecret && params.hostSecret === meta.hostSecret
  const players = await loadPlayers(store, code)
  const target = players.find((p) => p.id === params.playerId)
  if (!target) return getState(store, code)
  if (!isHost && target.ownerDeviceId !== deviceId) throw httpError(403, 'not_owner')
  await store.lrem(kPlayers(code), 1, target.raw)

  // Turn-Index ggf. einkürzen.
  const turn = await loadTurn(store, code)
  const n = players.length - 1
  if (n > 0 && turn.turnIndex >= n) {
    turn.turnIndex = 0
    turn.seq = (turn.seq || 0) + 1
    await saveTurn(store, code, turn)
  }
  await touch(store, code)
  return getState(store, code)
}

/** Song zur Playlist hinzufügen (jede:r im Raum darf). */
export async function addSong(store, params) {
  const code = params.code
  const meta = await loadMeta(store, code)
  const song = String(params.song || '').trim().slice(0, 200)
  if (!song) throw httpError(400, 'no_song')
  if (meta.songs.length >= MAX_SONGS) throw httpError(400, 'too_many_songs')
  meta.songs = [...meta.songs, song]
  await store.set(kMeta(code), JSON.stringify(meta), TTL)
  await touch(store, code)
  return getState(store, code)
}

/** Einstellungen ändern (nur Gastgeber): Reihenfolge / No-Repeat. */
export async function updateSettings(store, params) {
  const code = params.code
  const meta = await loadMeta(store, code)
  if (!params.hostSecret || params.hostSecret !== meta.hostSecret) throw httpError(403, 'not_host')
  if (params.order === 'manual' || params.order === 'random') meta.order = params.order
  if (typeof params.noRepeat === 'boolean') meta.noRepeat = params.noRepeat
  await store.set(kMeta(code), JSON.stringify(meta), TTL)
  await touch(store, code)
  return getState(store, code)
}

/** Spin auslösen – NUR das Gerät, dem der aktuelle Spieler gehört. */
export async function spin(store, params, opts = {}) {
  const rng = opts.rng || Math.random
  const now = opts.now || Date.now()
  const code = params.code
  const deviceId = String(params.deviceId || '').trim()
  const meta = await loadMeta(store, code)
  const players = await loadPlayers(store, code)
  if (players.length === 0) throw httpError(400, 'no_players')
  const turn = await loadTurn(store, code)
  const current = players[turn.turnIndex] || players[0]
  if (current.ownerDeviceId !== deviceId) throw httpError(403, 'not_your_turn')

  const noRepeat = meta.noRepeat !== false
  const lastIndex = turn.event ? turn.event.winnerIndex : null
  const { index, didReset } = pickWinnerIndex(meta.songs.length, turn.drawn || [], lastIndex, noRepeat, rng)
  const rarity = rollRarity(rng)

  const drawn = noRepeat ? (didReset ? [index] : [...(turn.drawn || []), index]) : []
  const seq = (turn.seq || 0) + 1
  const event = {
    seq,
    winnerIndex: index,
    rarity,
    singer: current.name,
    singerId: current.id,
    startAt: now + START_DELAY_MS,
  }
  await saveTurn(store, code, { turnIndex: turn.turnIndex, seq, event, drawn })
  await touch(store, code)
  return getState(store, code)
}

/** Turn weitergeben – aktueller Spieler (oder Gastgeber). */
export async function nextTurn(store, params, opts = {}) {
  const rng = opts.rng || Math.random
  const code = params.code
  const deviceId = String(params.deviceId || '').trim()
  const meta = await loadMeta(store, code)
  const players = await loadPlayers(store, code)
  if (players.length === 0) throw httpError(400, 'no_players')
  const turn = await loadTurn(store, code)
  const current = players[turn.turnIndex] || players[0]
  const isHost = params.hostSecret && params.hostSecret === meta.hostSecret
  if (!isHost && current.ownerDeviceId !== deviceId) throw httpError(403, 'not_your_turn')

  const nextIndex = nextTurnIndex(meta.order, turn.turnIndex, players.length, rng)
  await saveTurn(store, code, {
    turnIndex: nextIndex,
    seq: (turn.seq || 0) + 1,
    event: turn.event, // letzter Spin bleibt fürs Log; Clients triggern per event.seq
    drawn: turn.drawn || [],
  })
  await touch(store, code)
  return getState(store, code)
}
