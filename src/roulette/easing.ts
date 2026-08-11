// ─────────────────────────────────────────────────────────────
//  Easing-Kurven fuer die Roulette-Animation
//
//  Ziel-Gefuehl:  sehr schnell -> schnell -> mittel -> langsam -> STOP
//  Das entspricht einem starken "ease out" mit langem, weichem Auslauf.
// ─────────────────────────────────────────────────────────────

/**
 * Quintic Ease-Out: 1 - (1 - t)^5
 *
 * Sehr hohe Startgeschwindigkeit, langer sanfter Auslauf ohne
 * abrupten Stop. Fuehlt sich wie ein auslaufendes Rad / Case-Opening an.
 *
 * @param t normalisierter Fortschritt 0..1
 * @returns geglaetteter Fortschritt 0..1
 */
// Monoton steigend, kein Ueberschwingen -> die Animation faehrt sauber auf den
// Zielpunkt zu und bleibt dort direkt stehen (kein Zurueckfedern).
export function easeOutQuint(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 5)
}
