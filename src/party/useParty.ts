import { useCallback, useEffect, useRef, useState } from 'react'
import { getDeviceId } from './deviceId'
import * as api from './partyClient'
import type { PartySession, PartyState, TurnOrder } from './types'

const POLL_MS = 1500

interface UsePartyOptions {
  onError?: (code: string) => void
}

/**
 * Verwaltet eine Party-Sitzung: Session (persistiert), Polling des
 * Server-Zustands und alle Aktionen. Die eigentliche Spin-Animation
 * triggert die App anhand von `state.event.seq`.
 */
export function useParty({ onError }: UsePartyOptions = {}) {
  const deviceId = getDeviceId()
  const [session, setSession] = useState<PartySession | null>(null)
  const [state, setState] = useState<PartyState | null>(null)
  const sessionRef = useRef(session)
  sessionRef.current = session
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const setAndPersist = useCallback((s: PartySession | null) => {
    setSession(s)
    if (!s) setState(null)
  }, [])

  // Polling, solange eine Sitzung aktiv ist.
  useEffect(() => {
    if (!session?.code) return
    let alive = true
    const tick = async () => {
      try {
        const fresh = await api.fetchState(session.code)
        if (alive) setState(fresh)
      } catch (err) {
        const code = (err as { code?: string }).code
        if (code === 'room_not_found') {
          if (alive) {
            setSession(null)
            setState(null)
            onErrorRef.current?.('room_not_found')
          }
        }
        // andere Fehler: still ignorieren, nächster Tick versucht es erneut
      }
    }
    tick()
    const id = window.setInterval(tick, POLL_MS)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [session?.code])

  const create = useCallback(
    async (input: { name: string; songs: string[]; order: TurnOrder; noRepeat: boolean; initialNames: string[] }) => {
      const { code, hostSecret } = await api.createRoom(input)
      const fresh = await api.joinRoom(code)
      setState(fresh)
      setAndPersist({ code, hostSecret })
      return code
    },
    [setAndPersist],
  )

  const join = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim().toUpperCase()
      const fresh = await api.joinRoom(code)
      setState(fresh)
      setAndPersist({ code })
      return fresh
    },
    [setAndPersist],
  )

  const leave = useCallback(() => setAndPersist(null), [setAndPersist])

  const addName = useCallback(async (name: string) => {
    const s = sessionRef.current
    if (!s || !name.trim()) return
    setState(await api.addName(s.code, name.trim()))
  }, [])

  const removeName = useCallback(async (playerId: string) => {
    const s = sessionRef.current
    if (!s) return
    setState(await api.removeName(s.code, playerId, s.hostSecret))
  }, [])

  const setOrder = useCallback(async (order: TurnOrder) => {
    const s = sessionRef.current
    if (!s?.hostSecret) return
    setState(await api.updateSettings(s.code, s.hostSecret, { order }))
  }, [])

  const setNoRepeat = useCallback(async (noRepeat: boolean) => {
    const s = sessionRef.current
    if (!s?.hostSecret) return
    setState(await api.updateSettings(s.code, s.hostSecret, { noRepeat }))
  }, [])

  const spin = useCallback(async () => {
    const s = sessionRef.current
    if (!s) return
    setState(await api.spinRoom(s.code))
  }, [])

  const next = useCallback(async () => {
    const s = sessionRef.current
    if (!s) return
    setState(await api.nextTurn(s.code, s.hostSecret))
  }, [])

  const isHost = Boolean(session?.hostSecret)

  return {
    deviceId,
    session,
    state,
    isHost,
    create,
    join,
    leave,
    addName,
    removeName,
    setOrder,
    setNoRepeat,
    spin,
    next,
  }
}
