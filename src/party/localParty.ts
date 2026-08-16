import { useCallback, useRef, useState } from 'react'
import type { PartyState, Rarity, TurnOrder } from './types'

// ─────────────────────────────────────────────────────────────
//  Lokale Party (ein Gerät, KEIN Server / kein Upstash nötig).
//  Gleiche Spielmechanik wie online – Namen, Reihenfolge, „schon
//  gesungen", Gewinner + Gold – nur komplett im Browser.
//  Zum Handy-Herumreichen und für Leute ohne eigenes Handy.
// ─────────────────────────────────────────────────────────────

function genId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* Fallback */
  }
  return `p-${Math.random().toString(36).slice(2, 10)}`
}

function rollRarity(): Rarity {
  const r = Math.random()
  if (r < 1 / 10000) return 'gold'
  if (r < 0.05) return 'covert'
  if (r < 0.2) return 'classified'
  if (r < 0.5) return 'restricted'
  return 'milspec'
}

function pickWinnerIndex(
  count: number,
  drawn: number[],
  lastIndex: number | null,
  noRepeat: boolean,
): { index: number; didReset: boolean } {
  if (count <= 1) return { index: 0, didReset: false }
  let candidates: number[] = []
  for (let i = 0; i < count; i++) candidates.push(i)
  let didReset = false
  if (noRepeat) {
    const set = new Set(drawn)
    let cand = candidates.filter((i) => !set.has(i))
    if (cand.length === 0) {
      cand = candidates
      didReset = true
    }
    candidates = cand
  }
  if (lastIndex != null) {
    const wo = candidates.filter((i) => i !== lastIndex)
    if (wo.length > 0) candidates = wo
  }
  return { index: candidates[Math.floor(Math.random() * candidates.length)], didReset }
}

function nextIndex(order: TurnOrder, turnIndex: number, n: number): number {
  if (n <= 1) return 0
  if (order === 'random') {
    let i = turnIndex
    while (i === turnIndex) i = Math.floor(Math.random() * n)
    return i
  }
  return (turnIndex + 1) % n
}

/** Gleiche Schnittstelle wie `useParty`, aber ohne Netzwerk. */
export function useLocalParty() {
  const [state, setState] = useState<PartyState | null>(null)
  const drawnRef = useRef<number[]>([])

  const create = useCallback((name: string, songs: string[]) => {
    drawnRef.current = []
    setState({
      code: 'LOKAL',
      meta: { name: name || 'Party', songs, order: 'manual', noRepeat: true },
      players: [],
      turnIndex: 0,
      seq: 0,
      event: null,
      drawnCount: 0,
    })
  }, [])

  const addName = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    setState((s) =>
      s ? { ...s, players: [...s.players, { id: genId(), name: n, ownerDeviceId: 'local' }] } : s,
    )
  }, [])

  const removeName = useCallback((id: string) => {
    setState((s) => {
      if (!s) return s
      const players = s.players.filter((p) => p.id !== id)
      const turnIndex = s.turnIndex >= players.length ? 0 : s.turnIndex
      return { ...s, players, turnIndex }
    })
  }, [])

  const setOrder = useCallback((order: TurnOrder) => {
    setState((s) => (s ? { ...s, meta: { ...s.meta, order } } : s))
  }, [])

  const setNoRepeat = useCallback((noRepeat: boolean) => {
    setState((s) => (s ? { ...s, meta: { ...s.meta, noRepeat } } : s))
  }, [])

  const addSong = useCallback(async (song: string) => {
    const s = song.trim()
    if (!s) return
    setState((st) => (st ? { ...st, meta: { ...st.meta, songs: [...st.meta.songs, s] } } : st))
  }, [])

  const spin = useCallback(async () => {
    setState((s) => {
      if (!s || s.players.length === 0) return s
      const noRepeat = s.meta.noRepeat
      const last = s.event ? s.event.winnerIndex : null
      const { index, didReset } = pickWinnerIndex(s.meta.songs.length, drawnRef.current, last, noRepeat)
      drawnRef.current = noRepeat ? (didReset ? [index] : [...drawnRef.current, index]) : []
      const current = s.players[s.turnIndex]
      const seq = s.seq + 1
      return {
        ...s,
        seq,
        drawnCount: drawnRef.current.length,
        event: {
          seq,
          winnerIndex: index,
          rarity: rollRarity(),
          singer: current?.name ?? '—',
          singerId: current?.id ?? '',
          startAt: Date.now(),
        },
      }
    })
  }, [])

  const next = useCallback(async () => {
    setState((s) => {
      if (!s || s.players.length === 0) return s
      return { ...s, turnIndex: nextIndex(s.meta.order, s.turnIndex, s.players.length), seq: s.seq + 1 }
    })
  }, [])

  const leave = useCallback(() => {
    drawnRef.current = []
    setState(null)
  }, [])

  return {
    state,
    deviceId: 'local',
    isHost: true,
    session: null as { code: string; hostSecret?: string } | null,
    create,
    addName,
    removeName,
    setOrder,
    setNoRepeat,
    addSong,
    spin,
    next,
    leave,
  }
}
