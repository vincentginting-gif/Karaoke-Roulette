import type { Track } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
import { AlbumCover } from './AlbumCover'
import { DiceIcon, ExternalIcon } from './icons'

interface ResultProps {
  track: Track
  onAgain: () => void
  onOpenSpotify: () => void
  onChangePlaylist: () => void
}

/** Ergebnisbereich – prominente Präsentation des Gewinner-Songs. */
export function Result({ track, onAgain, onOpenSpotify, onChangePlaylist }: ResultProps) {
  const { t } = useI18n()
  return (
    <section className="stage stage-center result result-in">
      <p className="result-kicker">{t('result.kicker')}</p>

      <div className="result-cover-wrap glow-strong">
        <AlbumCover url={track.coverUrl} alt={`${track.title} – ${track.artist}`} className="result-cover" />
      </div>

      <h2 className="result-title">{track.title}</h2>
      <p className="result-artist">{track.artist}</p>

      <div className="result-actions">
        <button className="btn btn-spotify" onClick={onOpenSpotify}>
          <ExternalIcon className="btn-icon" />
          {t('result.open')}
        </button>
        <button className="btn btn-primary" onClick={onAgain}>
          <DiceIcon className="btn-icon" />
          {t('result.again')}
        </button>
      </div>

      <button className="btn btn-ghost result-switch" onClick={onChangePlaylist}>
        🔀 {t('result.switch')}
      </button>
    </section>
  )
}
