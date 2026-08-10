// ─────────────────────────────────────────────────────────────
//  Roulette-Engine – Gewinner-Auswahl & Strip-Aufbau
//
//  Reine Logik, kein DOM. Der Gewinner wird IMMER vor der Animation
//  bestimmt (deterministisch), die Animation laeuft nur darauf zu.
// ─────────────────────────────────────────────────────────────

import type { Track } from '../spotify/types'

/** Position der Gewinnerkarte im Strip (von hinten gezaehlt genug Puffer). */
export const WINNER_INDEX = 45
/** Gesamtlaenge des Strips in Karten. */
export const STRIP_LENGTH = 55

/**
 * Waehlt einen Gewinner-Track unter Beruecksichtigung bereits gezogener Songs.
 *
 * Regeln:
 *  - Songs aus `drawnIds` werden zunaechst vermieden.
 *  - Sind alle Songs gezogen, wird die Liste effektiv zurueckgesetzt
 *    (Auswahl aus dem gesamten Pool) und der Aufrufer sollte `reset` beachten.
 *  - Der zuletzt gezogene Song (`lastId`) wird nie direkt erneut gezogen,
 *    solange es Alternativen gibt.
 *
 * @returns Gewinner-Track und ob die History zurueckgesetzt wurde.
 */
export function pickWinner(
  tracks: Track[],
  drawnIds: Set<string>,
  lastId: string | null,
): { winner: Track; didReset: boolean } {
  if (tracks.length === 0) {
    throw new Error('Keine Songs zur Auswahl vorhanden.')
  }
  if (tracks.length === 1) {
    return { winner: tracks[0], didReset: false }
  }

  // Kandidaten = noch nicht gezogene Songs.
  let candidates = tracks.filter((t) => !drawnIds.has(t.id))
  let didReset = false

  // Alle Songs schon gezogen -> Pool zuruecksetzen.
  if (candidates.length === 0) {
    candidates = tracks
    didReset = true
  }

  // Den zuletzt gezogenen Song vermeiden, wenn moeglich.
  if (lastId) {
    const withoutLast = candidates.filter((t) => t.id !== lastId)
    if (withoutLast.length > 0) candidates = withoutLast
  }

  const winner = candidates[randomIndex(candidates.length)]
  return { winner, didReset }
}

/**
 * Baut den sichtbaren Karten-Strip fuer die Animation.
 * Der Gewinner sitzt an fester Position (WINNER_INDEX), der Rest wird
 * zufaellig mit Fuellern aus dem Pool befuellt (nur fuer die Optik).
 */
export function buildStrip(tracks: Track[], winner: Track): Track[] {
  const strip: Track[] = []
  for (let i = 0; i < STRIP_LENGTH; i++) {
    if (i === WINNER_INDEX) {
      strip.push(winner)
    } else {
      strip.push(tracks[randomIndex(tracks.length)])
    }
  }
  return strip
}

/** Kryptografisch zufaelliger Index (gleichverteilt genug fuer diesen Zweck). */
function randomIndex(length: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % length
}
