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
