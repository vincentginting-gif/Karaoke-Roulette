import type { Playlist } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
import { AlbumCover } from './AlbumCover'
import { Logo } from './Logo'
import { DiceIcon, TrashIcon, UndoIcon } from './icons'

interface HomeProps {
  playlist: Playlist
  onSpin: () => void
  onChangePlaylist: () => void
  onManageSongs: () => void
  onReset: () => void
  remaining: number
  total: number
}

/** Startseite nach Verbindung + Playlist-Auswahl: der große Button. */
export function Home({
  playlist,
  onSpin,
  onChangePlaylist,
  onManageSongs,
  onReset,
  remaining,
  total,
}: HomeProps) {
  const { t } = useI18n()
  const drawn = total - remaining
  return (
    <section className="stage stage-center fade-in">
      <div className="brand brand-compact">
        <div className="brand-logo brand-logo-compact">
          <Logo className="brand-logo-mark" />
        </div>
        <h1 className="brand-title">Karaoke Roulette</h1>
        <p className="brand-subtitle">{t('brand.subtitle')}</p>
      </div>

      <button className="active-playlist" onClick={onManageSongs} title={t('home.managePlaylist')}>
        <AlbumCover url={playlist.imageUrl} alt={playlist.name} className="active-playlist-cover" />
        <span className="active-playlist-meta">
          <span className="active-playlist-label">{t('home.playlist')}</span>
          <span className="active-playlist-name">{playlist.name}</span>
        </span>
        <span className="active-playlist-change">{t('home.manage')}</span>
      </button>

      <button className="btn btn-primary btn-spin glow-strong" onClick={onSpin}>
        <DiceIcon className="btn-icon" />
        {t('home.spin')}
      </button>

      <div className="home-actions">
        <button className="btn btn-ghost" onClick={onChangePlaylist}>
          🔀 {t('home.changePlaylist')}
        </button>
        <button className="btn btn-ghost" onClick={onManageSongs}>
          <TrashIcon className="btn-icon" />
          {t('home.manageSongs')}
        </button>
      </div>

      <p className="remaining-hint">
        {total > 0 &&
          t('home.remaining', {
            remaining,
            total,
            songs: t(total === 1 ? 'common.song' : 'common.songs'),
          })}
      </p>

      {drawn > 0 && (
        <button className="btn btn-ghost btn-reset" onClick={onReset}>
          <UndoIcon className="btn-icon" />
          {t('home.reset', { n: drawn })}
        </button>
      )}
    </section>
  )
}
