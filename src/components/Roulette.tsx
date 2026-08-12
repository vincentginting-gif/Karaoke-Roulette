import { useLayoutEffect, useRef } from 'react'
// (useRef für stabile Callback-Refs, damit die Animation genau einmal läuft)
import type { Track } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
import { easeOutCase } from '../roulette/easing'
import { playStart, playStop, playTick } from '../roulette/audio'
import { AlbumCover } from './AlbumCover'

interface RouletteProps {
  /** Vorgebauter Strip; der Gewinner sitzt an `winnerIndex`. */
  strip: Track[]
  winnerIndex: number
  soundEnabled: boolean
  /** Ueberraschungs-Modus: Cover & Titel der Karten verbergen. */
  surprise: boolean
  /** Wird aufgerufen, wenn die Animation vollständig gestoppt ist. */
  onComplete: () => void
}

const DURATION_MS = 5800

/**
 * Das Herzstück: eine deterministische, frame-rate-unabhängige
 * Case-Opening-artige Roulette-Animation.
 *
 * Der Gewinner steht vor dem Start fest (via winnerIndex). Die Animation
 * berechnet die Zielposition, die den Gewinner exakt unter dem Marker
 * zentriert, und fährt per Quintic-Ease-Out (schnell -> langsam -> STOP)
 * über ~5s dorthin. Da die Position aus der verstrichenen Zeit berechnet
 * wird (nicht aus Frame-Inkrementen), landet IMMER derselbe Song –
 * unabhängig von der Bildwiederholrate.
 */
export function Roulette({ strip, winnerIndex, soundEnabled, surprise, onComplete }: RouletteProps) {
  const { t } = useI18n()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Aktuellste Callback-/Flag-Werte in Refs halten, damit der Effekt NICHT
  // von ihrer Identität abhängt und die Animation genau EINMAL läuft
  // (kein Neustart bei Re-Renders des Parents).
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const soundRef = useRef(soundEnabled)
  soundRef.current = soundEnabled

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const cards = Array.from(track.children) as HTMLElement[]
    if (cards.length <= winnerIndex) return

    // Defensive: evtl. Reste eines vorherigen Laufs entfernen.
    for (const c of cards) c.classList.remove('is-center', 'is-winner')

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Layout exakt aus dem DOM messen, damit die Mathematik immer passt.
    const cardW = cards[0].offsetWidth
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cardW
    const vpCenter = viewport.clientWidth / 2

    // X-Verschiebung, die Karte `index` unter den Marker zentriert.
    const centerToX = (index: number) => vpCenter - (cards[index].offsetLeft + cardW / 2)

    const startIndex = Math.min(3, winnerIndex)
    const startX = centerToX(startIndex)

    // Nur ein winziger Versatz, damit der Stop nicht steril pixelgenau wirkt –
    // der Gewinner bleibt klar und sauber mittig unter dem Marker.
    const jitter = (Math.random() - 0.5) * step * 0.12
    const finalX = centerToX(winnerIndex) + jitter

    const duration = reduceMotion ? 700 : DURATION_MS

    // Startposition sofort setzen (useLayoutEffect -> kein Flash bei X=0).
    track.style.transform = `translate3d(${startX}px, 0, 0)`

    let rafId = 0
    let timeoutId = 0
    let startTs = 0
    let lastCenter = -1

    const setCenter = (idx: number) => {
      if (idx === lastCenter) return
      if (lastCenter >= 0) cards[lastCenter]?.classList.remove('is-center')
      cards[idx]?.classList.add('is-center')
      lastCenter = idx
      if (soundRef.current && !reduceMotion) playTick()
    }

    const finish = () => {
      // Zielposition exakt setzen und Gewinner hervorheben.
      track.style.transform = `translate3d(${finalX}px, 0, 0)`
      cards[lastCenter]?.classList.remove('is-center')
      cards[winnerIndex]?.classList.add('is-center', 'is-winner')
      if (soundRef.current) playStop()
      // Kurz den Gewinner unter dem Marker zeigen, dann direkt das Ergebnis.
      timeoutId = window.setTimeout(() => onCompleteRef.current(), reduceMotion ? 250 : 450)
    }

    const frame = (ts: number) => {
      if (!startTs) startTs = ts
      const t = Math.min(1, (ts - startTs) / duration)
      const eased = easeOutCase(t)
      const x = startX + (finalX - startX) * eased
      track.style.transform = `translate3d(${x}px, 0, 0)`

      // Karte, die gerade unter dem Marker liegt, hervorheben.
      const idx = Math.round((vpCenter - x - cardW / 2) / step)
      setCenter(Math.max(0, Math.min(cards.length - 1, idx)))

      if (t < 1) {
        rafId = requestAnimationFrame(frame)
      } else {
        finish()
      }
    }

    // Start-Whoosh (nur mit Ton und ohne reduzierte Bewegung).
    if (soundRef.current && !reduceMotion) playStart()

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
    // Bewusst nur [strip, winnerIndex]: die Animation soll pro Ziehung
    // genau einmal starten. soundEnabled/onComplete werden über Refs gelesen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strip, winnerIndex])

  return (
    <section className="stage stage-center roulette fade-in">
      <p className="roulette-hint">{surprise ? t('roulette.surprise') : t('roulette.which')}</p>

      <div className="roulette-viewport" ref={viewportRef}>
        {/* Fester Marker in der Mitte: eine saubere Linie mit bündigen Pfeilen */}
        <div className="roulette-marker" aria-hidden="true">
          <span className="marker-arrow marker-arrow-top" />
          <span className="marker-arrow marker-arrow-bottom" />
        </div>

        {/* Randverlauf für Tiefe */}
        <div className="roulette-fade roulette-fade-left" aria-hidden="true" />
        <div className="roulette-fade roulette-fade-right" aria-hidden="true" />

        {/* Beweglicher Karten-Track */}
        <div className="roulette-track" ref={trackRef}>
          {strip.map((track, i) =>
            surprise ? (
              // Ueberraschungs-Modus: Mystery-Karte ohne Cover/Titel.
              <article className="song-card song-card-mystery" key={i}>
                <div className="song-card-cover mystery-cover">
                  <span className="mystery-mark">?</span>
                </div>
                <div className="song-card-info">
                  <span className="song-card-title">???</span>
                  <span className="song-card-artist">&nbsp;</span>
                </div>
              </article>
            ) : (
              <article className="song-card" key={i}>
                <AlbumCover url={track.coverUrl} alt={track.title} className="song-card-cover" />
                <div className="song-card-info">
                  <span className="song-card-title">{track.title}</span>
                  <span className="song-card-artist">{track.artist}</span>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
