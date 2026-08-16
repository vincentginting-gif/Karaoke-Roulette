// Unit-Tests der Party-Kernlogik gegen den In-Memory-Store.
import { createMemStore } from './mem-store.mjs'
import {
  createRoom,
  getState,
  addPlayer,
  removePlayer,
  updateSettings,
  addSong,
  spin,
  nextTurn,
  pickWinnerIndex,
  nextTurnIndex,
} from '../api/party/_core.js'

let pass = 0
let fail = 0
function ok(cond, msg) {
  if (cond) {
    pass++
  } else {
    fail++
    console.error('  ✗ FAIL:', msg)
  }
}

// Deterministische RNG (LCG) für reproduzierbare Tests.
function lcg(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

async function run() {
  // ── pickWinnerIndex: No-Repeat + Reset ──
  {
    const rng = lcg(1)
    const drawn = [0, 1]
    const { index } = pickWinnerIndex(3, drawn, null, true, rng)
    ok(index === 2, `no-repeat wählt den einzig freien Index (2), war ${index}`)
    const res = pickWinnerIndex(2, [0, 1], null, true, rng)
    ok(res.didReset === true, 'alle gezogen -> didReset=true')
  }

  // ── nextTurnIndex ──
  {
    ok(nextTurnIndex('manual', 0, 3, Math.random) === 1, 'manual 0->1')
    ok(nextTurnIndex('manual', 2, 3, Math.random) === 0, 'manual wrap 2->0')
    const rng = lcg(7)
    for (let i = 0; i < 20; i++) {
      const n = nextTurnIndex('random', 1, 4, rng)
      ok(n !== 1 && n >= 0 && n < 4, `random meidet aktuellen (${n})`)
    }
  }

  // ── Vollständiger Ablauf ──
  const store = createMemStore()
  const rng = lcg(42)
  const songs = ['A - x', 'B - x', 'C - x', 'D - x']

  const { code, hostSecret } = await createRoom(
    store,
    { name: 'Test', songs, order: 'manual', noRepeat: true, deviceId: 'devHost', initialNames: ['Anna'] },
    { rng, now: 1000 },
  )
  ok(typeof code === 'string' && code.length === 6, 'Raum-Code erzeugt')

  // Zweites Gerät fügt zwei Namen hinzu (Handy-lose Gäste).
  await addPlayer(store, { code, deviceId: 'devB', name: 'Bob' })
  let state = await addPlayer(store, { code, deviceId: 'devB', name: 'Cara' })
  ok(state.players.length === 3, `3 Spieler (Anna, Bob, Cara), waren ${state.players.length}`)
  ok(state.players[0].name === 'Anna' && state.players[0].ownerDeviceId === 'devHost', 'Anna gehört Host')
  ok(state.players[1].ownerDeviceId === 'devB', 'Bob gehört Gerät B')

  // Spin: nur der Besitzer des aktuellen Spielers (Anna@devHost) darf.
  let denied = false
  try {
    await spin(store, { code, deviceId: 'devB' }, { rng, now: 2000 })
  } catch (e) {
    denied = e.code === 'not_your_turn'
  }
  ok(denied, 'fremdes Gerät darf nicht spinnen (not_your_turn)')

  state = await spin(store, { code, deviceId: 'devHost' }, { rng, now: 2000 })
  ok(state.event && state.event.singer === 'Anna', 'Spin: Sänger = Anna')
  ok(typeof state.event.winnerIndex === 'number', 'Spin: winnerIndex gesetzt')
  ok(state.event.startAt === 2000 + 1500, 'Spin: startAt = now + Vorlauf')
  ok(state.drawnCount === 1, 'No-Repeat: 1 gezogen')
  const firstWinner = state.event.winnerIndex

  // Nächster (manuell) -> Turn zu Bob.
  state = await nextTurn(store, { code, deviceId: 'devHost' }, { rng })
  ok(state.turnIndex === 1, `Turn -> Bob (Index 1), war ${state.turnIndex}`)

  // Jetzt darf Host NICHT (Bob ist dran, gehört devB).
  denied = false
  try {
    await spin(store, { code, deviceId: 'devHost' }, { rng, now: 3000 })
  } catch (e) {
    denied = e.code === 'not_your_turn'
  }
  ok(denied, 'Host darf nicht spinnen, wenn Bob dran ist')

  state = await spin(store, { code, deviceId: 'devB' }, { rng, now: 3000 })
  ok(state.event.singer === 'Bob', 'Spin 2: Sänger = Bob')
  ok(state.event.winnerIndex !== firstWinner, 'No-Repeat: anderes Lied als zuvor')
  ok(state.drawnCount === 2, 'No-Repeat: 2 gezogen')
  ok(state.seq > 0, 'seq erhöht sich')

  // Einstellungen: nur Host.
  denied = false
  try {
    await updateSettings(store, { code, hostSecret: 'wrong', order: 'random' })
  } catch (e) {
    denied = e.code === 'not_host'
  }
  ok(denied, 'falsches hostSecret -> not_host')
  state = await updateSettings(store, { code, hostSecret, order: 'random', noRepeat: false })
  ok(state.meta.order === 'random' && state.meta.noRepeat === false, 'Einstellungen aktualisiert')

  // Entfernen: nur eigenes Gerät.
  const bobId = state.players[1].id
  denied = false
  try {
    await removePlayer(store, { code, deviceId: 'devHost', playerId: bobId })
  } catch (e) {
    denied = e.code === 'not_owner'
  }
  ok(denied, 'fremdes Gerät darf Bob nicht entfernen')
  state = await removePlayer(store, { code, deviceId: 'devB', playerId: bobId })
  ok(state.players.length === 2 && !state.players.find((p) => p.id === bobId), 'Bob entfernt')

  // Song hinzufügen.
  const before = (await getState(store, code)).meta.songs.length
  state = await addSong(store, { code, song: 'Neuer Song - Test' })
  ok(state.meta.songs.length === before + 1, 'Song hinzugefügt (+1)')
  ok(state.meta.songs[state.meta.songs.length - 1] === 'Neuer Song - Test', 'Neuer Song am Ende')

  // Raum nicht gefunden.
  let notFound = false
  try {
    await getState(store, 'ZZZZZZ')
  } catch (e) {
    notFound = e.code === 'room_not_found'
  }
  ok(notFound, 'unbekannter Code -> room_not_found')

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
