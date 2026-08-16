// Typen für den Party-Modus (Frontend-Sicht auf den Server-Zustand).

export type TurnOrder = 'manual' | 'random'
export type Rarity = 'milspec' | 'restricted' | 'classified' | 'covert' | 'gold'

export interface PartyPlayer {
  id: string
  name: string
  ownerDeviceId: string
}

export interface PartyEvent {
  seq: number
  winnerIndex: number
  rarity: Rarity
  singer: string
  singerId: string
  /** Server-Zeit (ms), zu der alle Geräte den Spin starten sollen. */
  startAt: number
}

export interface PartyState {
  code: string
  meta: { name: string; songs: string[]; order: TurnOrder; noRepeat: boolean }
  players: PartyPlayer[]
  turnIndex: number
  seq: number
  event: PartyEvent | null
  drawnCount: number
}

/** Lokale Sitzung (persistiert für Reconnect nach Reload). */
export interface PartySession {
  code: string
  hostSecret?: string
}
