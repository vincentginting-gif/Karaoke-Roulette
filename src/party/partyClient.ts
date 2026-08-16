// Dünner Client für die /api/party/* Endpunkte.
// Misst nebenbei den Zeitversatz zum Server, damit alle Geräte den
// Spin ~gleichzeitig starten (event.startAt ist Server-Zeit).
import { getDeviceId } from './deviceId'
import type { PartyState, TurnOrder } from './types'

// serverTime ≈ localTime + offset  →  localTarget = serverTarget - offset
let serverOffsetMs = 0

/** Rechnet eine Server-Zielzeit in lokale Uhrzeit (ms) um. */
export function toLocalTime(serverMs: number): number {
  return serverMs - serverOffsetMs
}

interface ApiResult {
  ok: boolean
  error?: string
  state?: PartyState
  code?: string
  hostSecret?: string
  enabled?: boolean
}

async function call(path: string, body?: unknown, method = 'POST'): Promise<ApiResult> {
  const res = await fetch(`/api/party/${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  // Zeitversatz aus dem Date-Header aktualisieren (grobe, ausreichende Sync).
  const dateHeader = res.headers.get('date')
  if (dateHeader) {
    const serverMs = Date.parse(dateHeader)
    if (!Number.isNaN(serverMs)) serverOffsetMs = serverMs - Date.now()
  }
  let data: ApiResult
  try {
    data = (await res.json()) as ApiResult
  } catch {
    data = { ok: false, error: 'bad_response' }
  }
  if (!res.ok || !data.ok) {
    const err = new Error(data.error || `http_${res.status}`) as Error & { code?: string; status?: number }
    err.code = data.error
    err.status = res.status
    throw err
  }
  return data
}

export async function partyHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/party/health')
    if (!res.ok) return false
    const data = (await res.json()) as ApiResult
    return Boolean(data.ok && data.enabled)
  } catch {
    return false
  }
}

export async function createRoom(input: {
  name: string
  songs: string[]
  order: TurnOrder
  noRepeat: boolean
  initialNames: string[]
}): Promise<{ code: string; hostSecret: string }> {
  const data = await call('create', { ...input, deviceId: getDeviceId() })
  return { code: data.code as string, hostSecret: data.hostSecret as string }
}

export async function joinRoom(code: string): Promise<PartyState> {
  const data = await call('join', { code, deviceId: getDeviceId() })
  return data.state as PartyState
}

export async function fetchState(code: string): Promise<PartyState> {
  const data = await call(`state?code=${encodeURIComponent(code)}`, undefined, 'GET')
  return data.state as PartyState
}

export async function addName(code: string, name: string): Promise<PartyState> {
  const data = await call('players', { code, deviceId: getDeviceId(), action: 'add', name })
  return data.state as PartyState
}

export async function removeName(code: string, playerId: string, hostSecret?: string): Promise<PartyState> {
  const data = await call('players', { code, deviceId: getDeviceId(), action: 'remove', playerId, hostSecret })
  return data.state as PartyState
}

export async function updateSettings(
  code: string,
  hostSecret: string,
  patch: { order?: TurnOrder; noRepeat?: boolean },
): Promise<PartyState> {
  const data = await call('settings', { code, hostSecret, ...patch })
  return data.state as PartyState
}

export async function addSong(code: string, song: string): Promise<PartyState> {
  const data = await call('songs', { code, song })
  return data.state as PartyState
}

export async function spinRoom(code: string): Promise<PartyState> {
  const data = await call('spin', { code, deviceId: getDeviceId() })
  return data.state as PartyState
}

export async function nextTurn(code: string, hostSecret?: string): Promise<PartyState> {
  const data = await call('next', { code, deviceId: getDeviceId(), hostSecret })
  return data.state as PartyState
}
