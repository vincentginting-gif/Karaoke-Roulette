// ─────────────────────────────────────────────────────────────
//  Konfetti – abhängigkeitsfrei, Canvas-basiert (CSP-/offline-safe)
//  Wird gefeuert, wenn der Gewinner "Gold" ist (1/10000-Jackpot).
// ─────────────────────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  vrot: number
  /** 0 = Rechteck, 1 = Kreis */
  shape: number
  wobble: number
}

// Goldtöne + weiße Funken, passend zur Gold-Rarity.
const COLORS = ['#ffe27a', '#f5c542', '#e4ae39', '#fff3c4', '#ffffff', '#d99a1f']

const GRAVITY = 900 // px/s²
const DRAG = 0.86 // Luftwiderstand pro Sekunde (Faktor)
const LIFETIME_MS = 3200

/**
 * Feuert ein Gold-Konfetti-Feuerwerk über den gesamten Bildschirm.
 * Legt ein fixiertes Canvas über die Seite, animiert die Partikel
 * frame-rate-unabhängig und entfernt sich danach selbst.
 */
export function fireGoldConfetti(): void {
  if (typeof document === 'undefined') return
  // Bewegungssensible Nutzer nicht mit Partikeln überfluten.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const W = window.innerWidth
  const H = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999'
  canvas.width = Math.floor(W * dpr)
  canvas.height = Math.floor(H * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  document.body.appendChild(canvas)

  const particles: Particle[] = []

  // Zwei "Kanonen" unten links/rechts + eine Salve aus der Mitte –
  // ergibt einen satten, feierlichen Ausbruch.
  const spawnCannon = (originX: number, originY: number, angle: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.9 // ~±26°
      const a = angle + spread
      const speed = 620 + Math.random() * 520
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: 6 + Math.random() * 7,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 14,
        shape: Math.random() < 0.5 ? 0 : 1,
        wobble: Math.random() * Math.PI * 2,
      })
    }
  }

  // links unten -> nach rechts oben; rechts unten -> nach links oben; Mitte -> hoch
  spawnCannon(W * 0.08, H * 0.98, -Math.PI / 3, 90)
  spawnCannon(W * 0.92, H * 0.98, (-Math.PI * 2) / 3, 90)
  spawnCannon(W * 0.5, H * 1.02, -Math.PI / 2, 70)

  let rafId = 0
  let startTs = 0
  let lastTs = 0

  const frame = (ts: number) => {
    if (!startTs) {
      startTs = ts
      lastTs = ts
    }
    const dt = Math.min(0.05, (ts - lastTs) / 1000) // s, gegen Sprünge gedeckelt
    lastTs = ts
    const elapsed = ts - startTs

    ctx.clearRect(0, 0, W, H)

    const dragFactor = Math.pow(DRAG, dt)
    // Nach der ersten Sekunde sanft ausblenden.
    const fade = elapsed < LIFETIME_MS - 800 ? 1 : Math.max(0, (LIFETIME_MS - elapsed) / 800)

    for (const p of particles) {
      p.vx *= dragFactor
      p.vy = p.vy * dragFactor + GRAVITY * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vrot * dt
      p.wobble += dt * 6
      const sway = Math.sin(p.wobble) * 1.5
      p.x += sway

      ctx.save()
      ctx.globalAlpha = fade
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.shape === 0) {
        // Flattern: Höhe je nach Rotation stauchen -> "Papierschnipsel"
        const h = p.size * (0.5 + 0.5 * Math.abs(Math.cos(p.wobble)))
        ctx.fillRect(-p.size / 2, -h / 2, p.size, h)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    if (elapsed < LIFETIME_MS) {
      rafId = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(rafId)
      canvas.remove()
    }
  }

  rafId = requestAnimationFrame(frame)
}
