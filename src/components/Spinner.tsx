import { MicIcon } from './icons'

/**
 * Branded Ladeanimation: Mikrofon mit pulsierenden Ringen und einem
 * kleinen Equalizer – gibt dem Ladescreen Leben.
 */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-emblem" aria-hidden="true">
        <span className="loader-ring" />
        <span className="loader-ring loader-ring-2" />
        <MicIcon className="loader-mic" />
      </div>
      <div className="loader-eq" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      {label && <p className="spinner-label">{label}</p>}
    </div>
  )
}
