import { MusicNoteIcon } from './icons'

interface AlbumCoverProps {
  url: string | null
  alt: string
  className?: string
}

/**
 * Album-Cover mit Fallback. Behandelt den Fehlerfall "kein Cover"
 * (url === null) sowie kaputte Bild-URLs (onError) einheitlich.
 */
export function AlbumCover({ url, alt, className }: AlbumCoverProps) {
  // Quadranten-Cover: "quad:<0-3>:<bild-url>" zeigt ein Viertel eines
  // 2x2-Bildes (für den Offline-Modus, Cover aus einem geteilten Bild).
  if (url && url.startsWith('quad:')) {
    const rest = url.slice(5)
    const sep = rest.indexOf(':')
    const q = Number(rest.slice(0, sep)) || 0
    const src = rest.slice(sep + 1)
    const posX = q % 2 === 0 ? '0%' : '100%'
    const posY = q < 2 ? '0%' : '100%'
    return (
      <div
        className={`cover cover-quad ${className ?? ''}`}
        role="img"
        aria-label={alt}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: '200% 200%',
          backgroundPosition: `${posX} ${posY}`,
        }}
      />
    )
  }

  if (!url) {
    return (
      <div className={`cover cover-fallback ${className ?? ''}`} aria-label={alt}>
        <MusicNoteIcon className="cover-fallback-icon" />
      </div>
    )
  }
  return (
    <img
      className={`cover ${className ?? ''}`}
      src={url}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={(e) => {
        // Kaputtes Bild -> auf Fallback-Optik umschalten.
        const img = e.currentTarget
        img.style.display = 'none'
        img.parentElement?.classList.add('cover-broken')
      }}
    />
  )
}
