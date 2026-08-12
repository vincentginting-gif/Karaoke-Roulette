import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

const LANG_KEY = 'kr.lang'

/** Ermittelt die Startsprache aus Speicher bzw. Browser (Fallback: Deutsch). */
function detectLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved === 'de' || saved === 'en' || saved === 'ko') return saved
  const nav = (navigator.language || '').toLowerCase()
  if (nav.startsWith('ko')) return 'ko'
  if (nav.startsWith('en')) return 'en'
  return 'de'
}

type Translate = (key: string, params?: Record<string, string | number>) => string

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translate
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang())

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      /* ignore */
    }
    setLangState(next)
    document.documentElement.lang = next
  }, [])

  const t = useCallback<Translate>(
    (key, params) => {
      const entry = translations[key]
      let text = entry ? entry[lang] || entry.de : key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return text
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n muss innerhalb von I18nProvider verwendet werden.')
  return ctx
}
