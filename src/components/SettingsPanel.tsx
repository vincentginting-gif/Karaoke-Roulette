import { useI18n } from '../i18n/i18n'
import { MusicNoteIcon, SpotifyIcon, TrashIcon, UndoIcon } from './icons'
import { LanguageSwitcher } from './LanguageSwitcher'

interface SettingsPanelProps {
  soundEnabled: boolean
  onToggleSound: () => void
  surpriseMode: boolean
  onToggleSurprise: () => void
  drawnCount: number
  onReset: () => void
  excludedCount: number
  onManageSongs: () => void
  onChangePlatform: () => void
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
  excludedCount,
  onManageSongs,
  onChangePlatform,
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

          <button className="setting-action" onClick={onManageSongs}>
            <TrashIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">{t('settings.manage')}</span>
              <span className="setting-hint">
                {excludedCount > 0
                  ? t('settings.manageHintCount', { n: excludedCount })
                  : t('settings.manageHint')}
              </span>
            </span>
          </button>

          <button className="setting-action" onClick={onChangePlatform}>
            <MusicNoteIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">{t('settings.changePlatform')}</span>
              <span className="setting-hint">{t('settings.changePlatformHint')}</span>
            </span>
          </button>

          <button className="setting-action danger" onClick={onDisconnect}>
            <SpotifyIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">{t('settings.disconnect')}</span>
              <span className="setting-hint">{t('settings.disconnectHint')}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
