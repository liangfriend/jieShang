export const LOCALE_STORAGE_KEY = 'app.locale'

export type AppLocale = 'zh' | 'en'

export const DEFAULT_LOCALE: AppLocale = 'zh'

export const FALLBACK_LOCALE: AppLocale = 'en'

export const LOCALE_OPTIONS: { value: AppLocale; labelKey: string }[] = [
  { value: 'zh', labelKey: 'settings.language.zh' },
  { value: 'en', labelKey: 'settings.language.en' }
]

function isAppLocale(value: unknown): value is AppLocale {
  return value === 'zh' || value === 'en'
}

export function loadPersistedLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(raw) ? raw : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function persistLocale(locale: AppLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}
