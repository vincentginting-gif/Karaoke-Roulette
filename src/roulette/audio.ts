// ─────────────────────────────────────────────────────────────
//  Dezente Sound- & Haptik-Unterstuetzung fuer das Roulette
//
//  Bewusst minimal: kurze "Tick"-Toene beim Vorbeiziehen der Karten
//  und ein "Pop" beim Stop. Erzeugt via WebAudio (keine Assets noetig).
//  Alles fehlertolerant – wenn Audio nicht geht, laeuft die App normal.
// ─────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Muss nach einer User-Geste aufgerufen werden (Autoplay-Policy). */
export function unlockAudio(): void {
  getCtx()
}

/** Kurzer, leiser Klick – beim Vorbeiziehen einer Karte. */
export function playTick(): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'square'
    osc.frequency.value = 1200
    gain.gain.setValueAtTime(0.0001, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.05)
    osc.connect(gain).connect(ac.destination)
    osc.start()
    osc.stop(ac.currentTime + 0.06)
  } catch {
    /* ignore */
  }
}

/** Voller "Pop"/Chime beim finalen Stop. */
export function playStop(): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const now = ac.currentTime
    // Zwei kurze Toene fuer ein befriedigendes "Ta-da".
    const notes = [523.25, 783.99] // C5, G5
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const start = now + i * 0.08
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4)
      osc.connect(gain).connect(ac.destination)
      osc.start(start)
      osc.stop(start + 0.42)
    })
  } catch {
    /* ignore */
  }

  // Haptisches Feedback (mobil), wenn verfuegbar.
  try {
    navigator.vibrate?.(60)
  } catch {
    /* ignore */
  }
}
