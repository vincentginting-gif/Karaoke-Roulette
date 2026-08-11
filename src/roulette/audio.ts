// ─────────────────────────────────────────────────────────────
//  Sound- & Haptik-Feedback für das Roulette (WebAudio, keine Assets)
//
//  Nachempfunden dem CS:GO-"Case Opening": ein knackiger Tick, wenn eine
//  Karte am Marker vorbeizieht (dicht am Anfang, immer weiter auseinander
//  gegen Ende), ein kurzer Start-Whoosh und ein befriedigender Reveal-Sound.
//  Alles fehlertolerant – wenn Audio nicht geht, läuft die App normal.
// ─────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null
// Gemeinsame Lautstärke, damit die Ticks nicht übersteuern.
let master: GainNode | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = 0.9
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function out(): AudioNode {
  return master ?? ctx!.destination
}

/** Kurzer Rausch-Puffer (einmal erzeugt, dann wiederverwendet). */
function getNoise(ac: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const len = Math.floor(ac.sampleRate * 0.05) // 50 ms
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    noiseBuffer = buf
  }
  return noiseBuffer
}

/** Muss nach einer User-Geste aufgerufen werden (Autoplay-Policy). */
export function unlockAudio(): void {
  getCtx()
}

/** Knackiger, kurzer "Tick" – wenn eine Karte am Marker vorbeizieht. */
export function playTick(): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const now = ac.currentTime

    // Perkussiver Klick aus gefiltertem Rauschen.
    const src = ac.createBufferSource()
    src.buffer = getNoise(ac)
    const bp = ac.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2700
    bp.Q.value = 0.8
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.32, now + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.028)
    src.connect(bp).connect(g).connect(out())
    src.start(now)
    src.stop(now + 0.04)

    // Winzige Klick-Kante für mehr "Anschlag".
    const o = ac.createOscillator()
    const og = ac.createGain()
    o.type = 'square'
    o.frequency.value = 1500
    og.gain.setValueAtTime(0.0001, now)
    og.gain.exponentialRampToValueAtTime(0.05, now + 0.001)
    og.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)
    o.connect(og).connect(out())
    o.start(now)
    o.stop(now + 0.025)
  } catch {
    /* ignore */
  }
}

/** Kurzer, aufsteigender Whoosh beim Start des Roulettes. */
export function playStart(): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const now = ac.currentTime
    const src = ac.createBufferSource()
    src.buffer = getNoise(ac)
    src.loop = true
    const bp = ac.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(350, now)
    bp.frequency.exponentialRampToValueAtTime(2000, now + 0.35)
    bp.Q.value = 0.6
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.14, now + 0.09)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
    src.connect(bp).connect(g).connect(out())
    src.start(now)
    src.stop(now + 0.5)
  } catch {
    /* ignore */
  }
}

/** Befriedigender Reveal beim finalen Stop: Impact + aufsteigendes Glitzern. */
export function playStop(): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const now = ac.currentTime

    // Tiefer Impact ("Einrasten").
    const o1 = ac.createOscillator()
    const g1 = ac.createGain()
    o1.type = 'sine'
    o1.frequency.setValueAtTime(190, now)
    o1.frequency.exponentialRampToValueAtTime(70, now + 0.18)
    g1.gain.setValueAtTime(0.0001, now)
    g1.gain.exponentialRampToValueAtTime(0.32, now + 0.008)
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.26)
    o1.connect(g1).connect(out())
    o1.start(now)
    o1.stop(now + 0.3)

    // Heller, aufsteigender Reveal (E5 -> B5 -> E6).
    const notes = [659.25, 987.77, 1318.51]
    notes.forEach((freq, i) => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = 'triangle'
      o.frequency.value = freq
      const start = now + 0.05 + i * 0.06
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(0.16, start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
      o.connect(g).connect(out())
      o.start(start)
      o.stop(start + 0.55)
    })
  } catch {
    /* ignore */
  }

  // Haptisches Feedback (mobil), wenn verfügbar.
  try {
    navigator.vibrate?.(60)
  } catch {
    /* ignore */
  }
}
