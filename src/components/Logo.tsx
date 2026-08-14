import { useEffect, useState } from 'react'

interface LogoProps {
  className?: string
}

/**
 * App-Logo: neon Mikrofon im Roulette-Ring (Cyan-Außenring, Magenta innen).
 *
 * Standardmäßig als scharfes Inline-SVG gerendert. Legt der Nutzer sein
 * eigenes Bild unter `public/logo.png` ab, wird automatisch dieses verwendet
 * (ohne Broken-Image-Flash, da vorab geladen).
 */
export function Logo({ className }: LogoProps) {
  const [png, setPng] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setPng(true)
    img.src = `${import.meta.env.BASE_URL}logo.png`
  }, [])

  if (png) {
    return (
      <img
        className={`logo logo-img ${className ?? ''}`}
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="Karaoke Roulette"
        draggable={false}
      />
    )
  }

  return (
    <svg className={`logo logo-svg ${className ?? ''}`} viewBox="0 0 100 100" aria-hidden="true">
      <g className="logo-neon">
        {/* Äußerer Roulette-Ring (Cyan) + Ticks */}
        <circle className="logo-ring-outer" cx="50" cy="50" r="45" />
        <circle className="logo-ticks-outer" cx="50" cy="50" r="45" />
        {/* Innerer Ring (Magenta) + Ticks */}
        <circle className="logo-ring-inner" cx="50" cy="50" r="34" />
        <circle className="logo-ticks-inner" cx="50" cy="50" r="34" />
        {/* Mikrofon (Magenta) */}
        <g className="logo-mic" transform="translate(32 27) scale(1.5)">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </g>
      </g>
    </svg>
  )
}
