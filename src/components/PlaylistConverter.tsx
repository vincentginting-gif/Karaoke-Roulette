import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/i18n'
import { AlbumCover } from './AlbumCover'
import {
  ApiError,
  addTracksToPlaylist,
  createPlaylist,
  fetchCurrentUserId,
  type CreatedPlaylist,
} from '../spotify/api'
import { matchAll, parseList, type MatchResult } from '../spotify/convert'

interface PlaylistConverterProps {
  /** Eigene Spotify-User-ID (falls schon bekannt). */
  userId: string | null
  onError: (msg: string) => void
  onCancel: () => void
  /** Die frisch erstellte Playlist direkt in der App als Quelle verwenden. */
  onUsePlaylist: (created: CreatedPlaylist, trackCount: number) => void
}

type Phase = 'input' | 'matching' | 'review' | 'creating' | 'done'

const DEFAULT_NAME = 'Karaoke Roulette Import'

export function PlaylistConverter({ userId, onError, onCancel, onUsePlaylist }: PlaylistConverterProps) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>('input')
  const [text, setText] = useState('')
  const [artistFirst, setArtistFirst] = useState(false)
  const [name, setName] = useState(DEFAULT_NAME)
  const [results, setResults] = useState<MatchResult[]>([])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [created, setCreated] = useState<{ pl: CreatedPlaylist; count: number } | null>(null)

  // Live-Vorschau: wie viele Zeilen werden erkannt?
  const parsed = useMemo(() => parseList(text, artistFirst), [text, artistFirst])
  const includedCount = results.filter((r) => r.include && r.chosenIndex >= 0).length

  // ── Suchen / Abgleichen ──
  const startMatching = async () => {
    if (parsed.length === 0) {
      onError(t('convert.emptyInput'))
      return
    }
    setPhase('matching')
    setProgress({ done: 0, total: parsed.length })
    try {
      const res = await matchAll(parsed, (done, total) => setProgress({ done, total }))
      setResults(res)
      setExpanded(new Set())
      setPhase('review')
    } catch (e) {
      onError(e instanceof ApiError ? e.message : t('convert.searchFailed'))
      setPhase('input')
    }
  }

  // ── Auswahl-Manipulation ──
  const toggleInclude = (i: number) =>
    setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, include: !r.include } : r)))

  const chooseCandidate = (i: number, candIdx: number) =>
    setResults((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, chosenIndex: candIdx, include: true } : r)),
    )

  const toggleExpand = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  // ── Playlist erstellen ──
  const create = async () => {
    const chosen = results.filter((r) => r.include && r.chosenIndex >= 0)
    if (chosen.length === 0) {
      onError(t('convert.nothingSelected'))
      return
    }
    setPhase('creating')
    try {
      const uid = userId ?? (await fetchCurrentUserId())
      if (!uid) throw new ApiError(t('convert.noUser'), true)
      const pl = await createPlaylist(uid, name.trim() || DEFAULT_NAME, 'Karaoke Roulette', false)
      await addTracksToPlaylist(
        pl.id,
        chosen.map((r) => r.candidates[r.chosenIndex].track.id),
      )
      setCreated({ pl, count: chosen.length })
      setPhase('done')
    } catch (e) {
      onError(e instanceof ApiError ? e.message : t('convert.createFailed'))
      setPhase('review')
    }
  }

  const restart = () => {
    setText('')
    setResults([])
    setCreated(null)
    setPhase('input')
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <section className="stage fade-in conv">
      <header className="picker-header">
        <div>
          <h2 className="picker-title">{t('convert.title')}</h2>
          <p className="picker-subtitle">{t('convert.subtitle')}</p>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          {t('common.toPlaylists')}
        </button>
      </header>

      {phase === 'input' && (
        <div className="conv-input">
          <p className="conv-tip">{t('convert.tip')}</p>
          <textarea
            className="conv-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('convert.placeholder')}
            rows={10}
            spellCheck={false}
            aria-label={t('convert.textareaLabel')}
          />

          <div className="conv-row">
            <span className="conv-row-label">{t('convert.order')}</span>
            <div className="conv-seg" role="group" aria-label={t('convert.order')}>
              <button
                className={`conv-seg-btn${!artistFirst ? ' is-active' : ''}`}
                onClick={() => setArtistFirst(false)}
                aria-pressed={!artistFirst}
              >
                {t('convert.orderTitleFirst')}
              </button>
              <button
                className={`conv-seg-btn${artistFirst ? ' is-active' : ''}`}
                onClick={() => setArtistFirst(true)}
                aria-pressed={artistFirst}
              >
                {t('convert.orderArtistFirst')}
              </button>
            </div>
          </div>

          <div className="conv-row">
            <span className="conv-row-label">{t('convert.nameLabel')}</span>
            <input
              className="conv-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={DEFAULT_NAME}
              aria-label={t('convert.nameLabel')}
            />
          </div>

          <div className="conv-actions">
            <span className="conv-parsed">
              {parsed.length > 0 ? t('convert.parsedCount', { n: parsed.length }) : ' '}
            </span>
            <button
              className="btn btn-primary btn-spin glow-strong"
              onClick={startMatching}
              disabled={parsed.length === 0}
            >
              {t('convert.search')}
            </button>
          </div>
        </div>
      )}

      {phase === 'matching' && (
        <div className="conv-matching">
          <div className="conv-progress-bar">
            <div
              className="conv-progress-fill"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="conv-progress-text">
            {t('convert.matching', { done: progress.done, total: progress.total })}
          </p>
        </div>
      )}

      {(phase === 'review' || phase === 'creating') && (
        <div className="conv-review">
          <div className="conv-review-head">
            <span className="conv-included">
              {t('convert.included', { n: includedCount, total: results.length })}
            </span>
            <button
              className="btn btn-primary"
              onClick={create}
              disabled={includedCount === 0 || phase === 'creating'}
            >
              {phase === 'creating'
                ? t('convert.creating')
                : t('convert.create', { n: includedCount })}
            </button>
          </div>

          <ul className="conv-list">
            {results.map((r, i) => {
              const chosen = r.chosenIndex >= 0 ? r.candidates[r.chosenIndex] : null
              const isOpen = expanded.has(i)
              return (
                <li key={i} className={`conv-item conv-item-${r.status}${r.include ? '' : ' is-off'}`}>
                  <label className="conv-check">
                    <input
                      type="checkbox"
                      checked={r.include}
                      onChange={() => toggleInclude(i)}
                      disabled={r.chosenIndex < 0}
                    />
                  </label>

                  <div className="conv-src">
                    <span className="conv-src-title">{r.input.title}</span>
                    <span className="conv-src-artist">{r.input.artist || '—'}</span>
                  </div>

                  <span className="conv-arrow" aria-hidden="true">
                    →
                  </span>

                  {chosen ? (
                    <div className="conv-match">
                      <AlbumCover
                        url={chosen.track.coverUrl}
                        alt={chosen.track.title}
                        className="conv-match-cover"
                      />
                      <div className="conv-match-text">
                        <span className="conv-match-title">{chosen.track.title}</span>
                        <span className="conv-match-artist">{chosen.track.artist}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="conv-match conv-match-none">{t('convert.noMatch')}</div>
                  )}

                  <span className={`conv-badge conv-badge-${r.status}`}>
                    {t(`convert.confidence.${r.status}`)}
                  </span>

                  {r.candidates.length > 1 && (
                    <button className="conv-alt-toggle" onClick={() => toggleExpand(i)}>
                      {t('convert.otherMatches')} {isOpen ? '▲' : '▼'}
                    </button>
                  )}

                  {isOpen && r.candidates.length > 1 && (
                    <ul className="conv-alts">
                      {r.candidates.map((c, ci) => (
                        <li key={c.track.id}>
                          <button
                            className={`conv-alt${ci === r.chosenIndex ? ' is-chosen' : ''}`}
                            onClick={() => chooseCandidate(i, ci)}
                          >
                            <AlbumCover
                              url={c.track.coverUrl}
                              alt={c.track.title}
                              className="conv-alt-cover"
                            />
                            <span className="conv-alt-text">
                              <span className="conv-alt-title">{c.track.title}</span>
                              <span className="conv-alt-artist">{c.track.artist}</span>
                            </span>
                            <span className="conv-alt-score">{Math.round(c.score * 100)}%</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="conv-review-foot">
            <button className="btn btn-ghost" onClick={() => setPhase('input')}>
              {t('common.back')}
            </button>
            <button
              className="btn btn-primary"
              onClick={create}
              disabled={includedCount === 0 || phase === 'creating'}
            >
              {phase === 'creating' ? t('convert.creating') : t('convert.create', { n: includedCount })}
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && created && (
        <div className="conv-done">
          <div className="conv-done-emoji">🎉</div>
          <h3 className="conv-done-title">{t('convert.doneTitle')}</h3>
          <p className="conv-done-text">
            {t('convert.doneText', { name: created.pl.name, n: created.count })}
          </p>
          <div className="conv-done-actions">
            <button
              className="btn btn-primary btn-spin glow-strong"
              onClick={() => onUsePlaylist(created.pl, created.count)}
            >
              {t('convert.useHere')}
            </button>
            <a
              className="btn btn-ghost"
              href={created.pl.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('convert.openSpotify')}
            </a>
            <button className="btn btn-ghost" onClick={restart}>
              {t('convert.restart')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
