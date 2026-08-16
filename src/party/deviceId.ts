// Stabile, zufällige Geräte-ID (pro Browser). Damit „gehört" ein
// eingetragener Name genau dem Gerät, das ihn angelegt hat.
const KEY = 'kr.party.deviceId'

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    localStorage.setItem(KEY, id)
    return id
  } catch {
    return `dev-${Math.random().toString(36).slice(2)}`
  }
}
