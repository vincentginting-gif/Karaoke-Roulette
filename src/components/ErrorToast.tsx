interface ErrorToastProps {
  message: string
  onDismiss: () => void
}

/** Nicht-blockierende Fehlermeldung am unteren Rand. */
export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div className="toast" role="alert">
      <span className="toast-text">{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Meldung schließen">
        ✕
      </button>
    </div>
  )
}
