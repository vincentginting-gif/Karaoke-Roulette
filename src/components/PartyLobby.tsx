import { useState } from 'react'
import { useI18n } from '../i18n/i18n'
import type { PartyState, TurnOrder } from '../party/types'
import { Logo } from './Logo'
import { DiceIcon } from './icons'

interface PartyLobbyProps {
  state: PartyState
  deviceId: string
  isHost: boolean
  isMyTurn: boolean
  /** Lokale Party (ein Gerät, kein Code/Link zum Teilen). */
  local: boolean
  /** Ist der Song-Pool bereit (Cover geladen)? */
  ready: boolean
  onAddName: (name: string) => void
  onRemoveName: (playerId: string) => void
  onSetOrder: (order: TurnOrder) => void
  onSetNoRepeat: (v: boolean) => void
  onSpin: () => void
  onCopyLink: () => void
  onLeave: () => void
}

/**
 * Party-Hub (Aufbau UND Spielbetrieb in einem Screen):
 * Code teilen, Namen eintragen, Einstellungen (nur Gastgeber) und der
 * große Spin-Button – aktiv nur, wenn dieses Gerät dran ist.
 */
export function PartyLobby({
  state,
  deviceId,
  isHost,
  isMyTurn,
  local,
  ready,
  onAddName,
  onRemoveName,
  onSetOrder,
  onSetNoRepeat,
  onSpin,
  onCopyLink,
  onLeave,
}: PartyLobbyProps) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const current = state.players[state.turnIndex]
  const singer = current?.name ?? '—'

  const add = () => {
    const n = name.trim()
    if (!n) return
    onAddName(n)
    setName('')
  }

  return (
    <section className="stage fade-in party">
      <header className="party-header">
        <div className="party-header-logo" aria-hidden="true">
          <Logo />
        </div>
        {local ? (
          <div className="party-code-box">
            <span className="party-code-label">{t('party.localTag')}</span>
            <span className="party-local-hint">{t('party.localHint')}</span>
          </div>
        ) : (
          <div className="party-code-box">
            <span className="party-code-label">{t('party.code')}</span>
            <span className="party-code">{state.code}</span>
            <button className="offline-link-btn" onClick={onCopyLink}>
              🔗 {t('party.copyLink')}
            </button>
          </div>
        )}
      </header>

      {/* Wer ist dran + Spin */}
      <div className="party-turn">
        {state.players.length === 0 ? (
          <p className="party-turn-hint">{t('party.needNames')}</p>
        ) : (
          <>
            <p className="party-turn-label">{t('party.turn')}</p>
            <p className="party-turn-name">🎤 {singer}</p>
            {isMyTurn ? (
              <button
                className="btn btn-primary btn-spin glow-strong party-spin"
                onClick={onSpin}
                disabled={!ready}
              >
                <DiceIcon className="btn-icon" />
                {t('party.spin')}
              </button>
            ) : (
              <p className="party-wait">{t('party.waitTurn', { name: singer })}</p>
            )}
          </>
        )}
      </div>

      {/* Namensliste */}
      <div className="party-players">
        <h3 className="offline-section">
          {t('party.players')} ({state.players.length})
        </h3>
        <ul className="party-player-list">
          {state.players.map((p, i) => {
            const mine = p.ownerDeviceId === deviceId
            const active = i === state.turnIndex
            return (
              <li key={p.id} className={`party-player${active ? ' is-active' : ''}`}>
                <span className="party-player-name">
                  {active ? '🎤 ' : ''}
                  {p.name}
                </span>
                {(mine || isHost) && (
                  <button
                    className="party-player-remove"
                    onClick={() => onRemoveName(p.id)}
                    aria-label={t('party.remove')}
                    title={t('party.remove')}
                  >
                    ✕
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <div className="party-add">
          <input
            className="conv-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={t('party.namePlaceholder')}
            aria-label={t('party.addName')}
            maxLength={40}
          />
          <button className="btn btn-ghost" onClick={add}>
            ＋ {t('party.addName')}
          </button>
        </div>
        <p className="party-hint">{t('party.addHint')}</p>
      </div>

      {/* Einstellungen (nur Gastgeber) */}
      {isHost && (
        <div className="party-settings">
          <div className="conv-row">
            <span className="conv-row-label">{t('party.order')}</span>
            <div className="conv-seg" role="group" aria-label={t('party.order')}>
              <button
                className={`conv-seg-btn${state.meta.order === 'manual' ? ' is-active' : ''}`}
                onClick={() => onSetOrder('manual')}
                aria-pressed={state.meta.order === 'manual'}
              >
                {t('party.orderManual')}
              </button>
              <button
                className={`conv-seg-btn${state.meta.order === 'random' ? ' is-active' : ''}`}
                onClick={() => onSetOrder('random')}
                aria-pressed={state.meta.order === 'random'}
              >
                {t('party.orderRandom')}
              </button>
            </div>
          </div>
          <label className="party-toggle">
            <input
              type="checkbox"
              checked={state.meta.noRepeat}
              onChange={(e) => onSetNoRepeat(e.target.checked)}
            />
            {t('party.noRepeat')}
          </label>
        </div>
      )}

      <button className="btn btn-ghost party-leave" onClick={onLeave}>
        {t('party.leave')}
      </button>
    </section>
  )
}

interface PartyJoinProps {
  onJoin: (code: string) => void
  error: string | null
  busy: boolean
}

/** Beitritts-Screen: Code eingeben. */
export function PartyJoin({ onJoin, error, busy }: PartyJoinProps) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  return (
    <section className="stage stage-center fade-in party-join">
      <div className="party-header-logo" aria-hidden="true">
        <Logo />
      </div>
      <h2 className="picker-title">{t('party.joinTitle')}</h2>
      <p className="picker-subtitle">{t('party.joinHint')}</p>
      <input
        className="conv-name-input party-code-input"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && code.trim() && onJoin(code.trim())}
        placeholder="PARTY-CODE"
        aria-label={t('party.joinTitle')}
        maxLength={6}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
      />
      {error && <p className="party-error">{error}</p>}
      <button
        className="btn btn-primary btn-spin glow-strong"
        disabled={busy || code.trim().length < 4}
        onClick={() => onJoin(code.trim())}
      >
        {t('party.joinBtn')}
      </button>
    </section>
  )
}
