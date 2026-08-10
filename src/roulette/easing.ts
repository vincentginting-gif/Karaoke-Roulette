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
export function easeOutQuint(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 5)
}

/**
 * Optional: leichter "Settle"-Effekt am Ende (minimales Zurueckfedern),
 * damit der Stop nicht steril wirkt. Sehr dezent gehalten.
 *
 * Nur im letzten Teil der Animation aktiv.
 */
export function easeOutWithSettle(t: number): number {
  const base = easeOutQuint(t)
  if (t < 0.9) return base
  // In den letzten 10% ein winziges gedaempftes Nachschwingen.
  const local = (t - 0.9) / 0.1 // 0..1
  const wobble = Math.sin(local * Math.PI) * (1 - local) * 0.004
  return base + wobble
}
