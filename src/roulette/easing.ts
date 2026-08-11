// ─────────────────────────────────────────────────────────────
//  Easing-Kurven für die Roulette-Animation
//
//  Ziel-Gefühl:  sehr schnell -> schnell -> mittel -> langsam -> STOP
//  Das entspricht einem starken "ease out" mit langem, weichem Auslauf.
// ─────────────────────────────────────────────────────────────

/**
 * Quintic Ease-Out: 1 - (1 - t)^5
 *
 * Sehr hohe Startgeschwindigkeit, langer sanfter Auslauf ohne
 * abrupten Stop. Fühlt sich wie ein auslaufendes Rad / Case-Opening an.
 *
 * @param t normalisierter Fortschritt 0..1
 * @returns geglätteter Fortschritt 0..1
 */
// Monoton steigend, kein Überschwingen -> die Animation fährt sauber auf den
// Zielpunkt zu und bleibt dort direkt stehen (kein Zurückfedern).
export function easeOutQuint(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 5)
}

/**
 * Easing im Stil eines CS:GO-"Case Opening":
 * schneller, verwischter Start, dann ein langer, gleichmäßiger Auslauf, bei
 * dem die Karten (und damit die Tick-Sounds) immer weiter auseinander driften –
 * bis der Gewinner unter dem Marker einrastet. Monoton, kein Zurückfedern.
 *
 * Potenz 2.4 ist bewusst gewählt: hoch genug für den "Whoosh"-Start, aber
 * flach genug, dass die letzten Ticks einzeln hörbar langsamer werden.
 */
export function easeOutCase(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 2.4)
}
