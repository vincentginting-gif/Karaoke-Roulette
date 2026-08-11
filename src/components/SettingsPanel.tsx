import { SpotifyIcon, TrashIcon, UndoIcon } from './icons'

interface SettingsPanelProps {
  soundEnabled: boolean
  onToggleSound: () => void
  surpriseMode: boolean
  onToggleSurprise: () => void
  drawnCount: number
  onReset: () => void
  excludedCount: number
  onManageSongs: () => void
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
  onClose,
  onDisconnect,
}: SettingsPanelProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Einstellungen">
        <div className="modal-header">
          <h2 className="modal-title">Einstellungen</h2>
          <button className="modal-close" onClick={onClose} aria-label="Schließen">
            ✕
          </button>
        </div>

        <div className="settings-list">
          <Toggle
            checked={soundEnabled}
            onChange={onToggleSound}
            label="Sound"
            hint="Tick- und Reveal-Geräusche"
          />
          <Toggle
            checked={surpriseMode}
            onChange={onToggleSurprise}
            label="Überraschungs-Modus"
            hint="Cover & Titel im Roulette verstecken – volle Überraschung"
          />

          <button className="setting-action" onClick={onReset} disabled={drawnCount === 0}>
            <UndoIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">Gezogene Songs zurücksetzen</span>
              <span className="setting-hint">
                {drawnCount > 0
                  ? `${drawnCount} bereits gezogen – wieder in den Pool holen`
                  : 'Aktuell sind keine Songs als gezogen markiert'}
              </span>
            </span>
          </button>

          <button className="setting-action" onClick={onManageSongs}>
            <TrashIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">Songs verwalten</span>
              <span className="setting-hint">
                Songs aus dem Pool entfernen
                {excludedCount > 0 ? ` (${excludedCount} entfernt)` : ''}
              </span>
            </span>
          </button>

          <button className="setting-action danger" onClick={onDisconnect}>
            <SpotifyIcon className="setting-action-icon" />
            <span className="setting-text">
              <span className="setting-label">Spotify trennen</span>
              <span className="setting-hint">Abmelden und Verbindung lösen</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
