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

/**
 * Easing im Stil eines CS:GO-"Case Opening":
 * schneller, verwischter Start, dann ein langer, gleichmaessiger Auslauf, bei
 * dem die Karten (und damit die Tick-Sounds) immer weiter auseinander driften –
 * bis der Gewinner unter dem Marker einrastet. Monoton, kein Zurueckfedern.
 *
 * Potenz 2.4 ist bewusst gewaehlt: hoch genug fuer den "Whoosh"-Start, aber
 * flach genug, dass die letzten Ticks einzeln hoerbar langsamer werden.
 */
export function easeOutCase(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 2.4)
}
