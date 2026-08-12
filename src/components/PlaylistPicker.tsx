import { useRef } from 'react'
import type { Playlist } from '../spotify/types'
import { useI18n } from '../i18n/i18n'
import { AlbumCover } from './AlbumCover'
import { Spinner } from './Spinner'

interface PlaylistPickerProps {
  playlists: Playlist[]
  loading: boolean
  onSelect: (playlist: Playlist) => void
  onDiscover: () => void
  onArtists: () => void
  onAlbums: () => void
  onConvert: () => void
  onImport: (file: File) => void
  onCancel?: () => void
}

/** Auswahl-Grid der Nutzer-Playlists. */
export function PlaylistPicker({
  playlists,
  loading,
  onSelect,
  onDiscover,
  onArtists,
  onAlbums,
  onConvert,
  onImport,
  onCancel,
}: PlaylistPickerProps) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onImport(file)
  }

  return (
    <section className="stage fade-in">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">{t('picker.title')}</h2>
          <p className="picker-subtitle">{t('picker.subtitle')}</p>
        </div>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel}>
            {t('common.back')}
          </button>
        )}
      </header>

      <div className="discover-banners">
        <button className="discover-banner" onClick={onDiscover}>
          <span className="discover-banner-emoji">🎧</span>
          <span className="discover-banner-text">
            <span className="discover-banner-title">{t('picker.genre.title')}</span>
            <span className="discover-banner-hint">{t('picker.genre.hint')}</span>
          </span>
          <span className="discover-banner-arrow">→</span>
        </button>

        <button className="discover-banner" onClick={onArtists}>
          <span className="discover-banner-emoji">🎙️</span>
          <span className="discover-banner-text">
            <span className="discover-banner-title">{t('picker.artist.title')}</span>
            <span className="discover-banner-hint">{t('picker.artist.hint')}</span>
          </span>
          <span className="discover-banner-arrow">→</span>
        </button>

        <button className="discover-banner" onClick={onAlbums}>
          <span className="discover-banner-emoji">💿</span>
          <span className="discover-banner-text">
            <span className="discover-banner-title">{t('picker.album.title')}</span>
            <span className="discover-banner-hint">{t('picker.album.hint')}</span>
          </span>
          <span className="discover-banner-arrow">→</span>
        </button>

        <button className="discover-banner discover-banner-convert" onClick={onConvert}>
          <span className="discover-banner-emoji">🔄</span>
          <span className="discover-banner-text">
            <span className="discover-banner-title">{t('picker.convert.title')}</span>
            <span className="discover-banner-hint">{t('picker.convert.hint')}</span>
          </span>
          <span className="discover-banner-arrow">→</span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        <button className="discover-banner discover-banner-import" onClick={() => fileRef.current?.click()}>
          <span className="discover-banner-emoji">📂</span>
          <span className="discover-banner-text">
            <span className="discover-banner-title">{t('picker.import.title')}</span>
            <span className="discover-banner-hint">{t('picker.import.hint')}</span>
          </span>
          <span className="discover-banner-arrow">→</span>
        </button>
      </div>

      {loading ? (
        <Spinner label={t('picker.loading')} />
      ) : playlists.length === 0 ? (
        <div className="empty-state">
          <p>{t('picker.empty')}</p>
        </div>
      ) : (
        <ul className="playlist-grid">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button
                className={`playlist-card${pl.isOwn ? '' : ' playlist-card-foreign'}`}
                onClick={() => onSelect(pl)}
                title={pl.isOwn ? pl.name : t('picker.foreign', { name: pl.name })}
              >
                <div className="playlist-cover-wrap">
                  <AlbumCover url={pl.imageUrl} alt={pl.name} className="playlist-cover" />
                  {!pl.isOwn && <span className="playlist-badge">Spotify</span>}
                </div>
                <div className="playlist-info">
                  <span className="playlist-name">{pl.name}</span>
                  <span className="playlist-count">
                    {pl.trackCount} {t(pl.trackCount === 1 ? 'common.song' : 'common.songs')}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
