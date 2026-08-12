import { useI18n } from '../i18n/i18n'
import { LANGS } from '../i18n/translations'

/** Kompakte Sprachauswahl (Flaggen-Chips). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n()
  return (
    <div className={`lang-switch${className ? ` ${className}` : ''}`} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`lang-chip${lang === l.code ? ' lang-chip-active' : ''}`}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          aria-label={l.label}
          title={l.label}
        >
          <span className="lang-flag">{l.flag}</span>
          <span className="lang-label">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
