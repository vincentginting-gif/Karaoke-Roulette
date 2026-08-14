import { useI18n } from '../i18n/i18n'
import { ExternalIcon, MusicNoteIcon, SpotifyIcon, UndoIcon } from './icons'
import { LanguageSwitcher } from './LanguageSwitcher'

interface SettingsPanelProps {
  soundEnabled: boolean
  onToggleSound: () => void
  surpriseMode: boolean
  onToggleSurprise: () => void
  drawnCount: number
  onReset: () => void
  isGuest: boolean
  canExportGuest: boolean
  onExportGuest: () => void
  onExitGuest: () => void
  onClose: () => void
  onDisconnect: () => void
}

/** Kleiner, wiederverwendbarer Umschalter (Toggle-Switch). */
function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: () => void
  label: string
  hint?: string
}) {
  return (
    <button className="setting-row" onClick={onChange} role="switch" aria-checked={checked}>
      <span className="setting-text">
        <span className="setting-label">{label}</span>
        {hint && <span className="setting-hint">{hint}</span>}
      </span>
      <span className={`switch${checked ? ' switch-on' : ''}`}>
        <span className="switch-knob" />
      </span>
    </button>
  )
}

/** Einstellungen als modale Overlay-Karte. */
export function SettingsPanel({
  soundEnabled,
  onToggleSound,
  surpriseMode,
  onToggleSurprise,
  drawnCount,
  onReset,
  isGuest,
  canExportGuest,
  onExportGuest,
  onExitGuest,
  onClose,
  onDisconnect,
}: SettingsPanelProps) {
  const { t } = useI18n()
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t('settings.title')}>
        <div className="modal-header">
          <h2 className="modal-title">{t('settings.title')}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t('settings.close')}>
            ✕
          </button>
        </div>

        <div className="settings-list">
          <div className="setting-block">
            <span className="setting-label">{t('settings.language')}</span>
            <LanguageSwitcher className="lang-switch-settings" />
          </div>

          <Toggle
            checked={soundEnabled}
            onChange={onToggleSound}
            label={t('settings.sound')}
            hint={t('settings.soundHint')}
          />
          <Toggle
            checked={surpriseMode}
            onChange={onToggleSurprise}
            label={t('settings.surprise')}
            hint={t('settings.surpriseHint')}
          />

          <button className="setting-action" onClick={onReset} disabled={drawnCount === 0}>
            <UndoIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">{t('settings.reset')}</span>
              <span className="setting-hint">
                {drawnCount > 0
                  ? t('settings.resetHint', { n: drawnCount })
                  : t('settings.resetHintNone')}
              </span>
            </span>
          </button>

          {canExportGuest && (
            <button className="setting-action" onClick={onExportGuest}>
              <ExternalIcon className="setting-action-icon" />
              <span className="setting-text">
                <span className="setting-label">{t('settings.exportGuest')}</span>
                <span className="setting-hint">{t('settings.exportGuestHint')}</span>
              </span>
            </button>
          )}

          {isGuest ? (
            <button className="setting-action" onClick={onExitGuest}>
              <MusicNoteIcon className="setting-action-icon" />
              <span className="setting-text">
                <span className="setting-label">{t('settings.exitGuest')}</span>
                <span className="setting-hint">{t('settings.exitGuestHint')}</span>
              </span>
            </button>
          ) : (
            <button className="setting-action danger" onClick={onDisconnect}>
              <SpotifyIcon className="setting-action-icon" />
              <span className="setting-text">
                <span className="setting-label">{t('settings.disconnect')}</span>
                <span className="setting-hint">{t('settings.disconnectHint')}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
