import { useEffect, useState } from 'react'
import type { Track } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
import { fetchPlatformLinks, songlinkPageUrl, type PlatformLink } from '../spotify/odesli'
import { cachedCover, fetchCover } from '../spotify/itunes'
import { AlbumCover } from './AlbumCover'
import { DiceIcon, ExternalIcon } from './icons'

interface PartyResult {
  /** Name der Person, die jetzt singt. */
  singer: string
  /** Darf dieses Gerät weitergeben (ist der/die Sänger:in dran)? */
  canNext: boolean
  /** Turn an die nächste Person übergeben. */
  onNext: () => void
}

interface ResultProps {
  track: Track
  onAgain: () => void
  onChangePlaylist: () => void
  /** Party-Modus: Sänger:in anzeigen + „Nächster"-Button statt „nochmal". */
  party?: PartyResult
}

/** Ergebnisbereich – prominente Präsentation des Gewinner-Songs. */
export function Result({ track, onAgain, onChangePlaylist, party }: ResultProps) {
  const { t } = useI18n()
  const [links, setLinks] = useState<PlatformLink[]>([])

  // Echte Spotify-Track-ID? (22 Base62-Zeichen). Offline-Songs haben keine –
  // dann wird „Öffnen" zur Spotify-Suche und die Cross-Plattform-Links entfallen.
  const isRealTrack = /^[A-Za-z0-9]{22}$/.test(track.id)

  // Offline-Songs haben kein eigenes Cover -> echtes Cover (iTunes)
  // nachladen, damit der Gewinner ein passendes Cover hat.
  const isPlaceholder = !track.coverUrl || track.coverUrl.startsWith('quad:')
  const [cover, setCover] = useState<string | null>(
    isPlaceholder ? cachedCover(track.title, track.artist) ?? track.coverUrl : track.coverUrl,
  )
  useEffect(() => {
    if (!isPlaceholder) {
      setCover(track.coverUrl)
      return
    }
    const hit = cachedCover(track.title, track.artist)
    setCover(hit ?? track.coverUrl)
    if (hit) return
    let cancelled = false
    void fetchCover(track.title, track.artist).then((u) => {
      if (!cancelled && u) setCover(u)
    })
    return () => {
      cancelled = true
    }
  }, [track.id, track.title, track.artist, track.coverUrl, isPlaceholder])

  // Best-Effort: direkte Links zu anderen Plattformen laden. Bei Fehler
  // (CORS/Netzwerk) bleibt es beim universellen „song.link"-Button.
  useEffect(() => {
    if (!isRealTrack) return
    let cancelled = false
    setLinks([])
    fetchPlatformLinks(track.spotifyUrl)
      .then((l) => {
        if (!cancelled) setLinks(l)
      })
      .catch(() => {
        /* still: universeller Button reicht */
      })
    return () => {
      cancelled = true
    }
  }, [track.spotifyUrl, isRealTrack])

  return (
    <section className="stage stage-center result result-in">
      <p className="result-kicker">
        {party ? t('party.sings', { name: party.singer }) : t('result.kicker')}
      </p>

      <div className="result-cover-wrap glow-strong">
        <AlbumCover url={cover} alt={`${track.title} – ${track.artist}`} className="result-cover" />
      </div>

      <h2 className="result-title">{track.title}</h2>
      <p className="result-artist">{track.artist}</p>

      <div className="result-actions">
        {/* Als echter Link (statt window.open) – funktioniert auf PC und Handy. */}
        <a
          className="btn btn-spotify"
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalIcon className="btn-icon" />
          {isRealTrack ? t('result.open') : t('result.search')}
        </a>
        {party ? (
          party.canNext ? (
            <button className="btn btn-primary" onClick={party.onNext}>
              <DiceIcon className="btn-icon" />
              {t('party.next')}
            </button>
          ) : (
            <span className="result-wait">{t('party.waitNext', { name: party.singer })}</span>
          )
        ) : (
          <button className="btn btn-primary" onClick={onAgain}>
            <DiceIcon className="btn-icon" />
            {t('result.again')}
          </button>
        )}
      </div>

      {isRealTrack && (
        <div className="result-cross">
          <a
            className="result-cross-main"
            href={songlinkPageUrl(track.id)}
            target="_blank"
            rel="noreferrer"
          >
            🌐 {t('result.openElsewhere')}
          </a>
          {links.length > 0 && (
            <div className="result-cross-chips">
              {links.map((l) => (
                <a
                  key={l.key}
                  className="result-cross-chip"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {!party && (
        <button className="btn btn-ghost result-switch" onClick={onChangePlaylist}>
          🔀 {t('result.switch')}
        </button>
      )}
    </section>
  )
}
