export const LOCALE_STORAGE_KEY = 'app.locale'

export type AppLocale = 'zh' | 'en' | 'ja'

export const DEFAULT_LOCALE: AppLocale = 'zh'

export const FALLBACK_LOCALE: AppLocale = 'en'

export const LOCALE_OPTIONS: { value: AppLocale; labelKey: string }[] = [
  { value: 'zh', labelKey: 'settings.language.zh' },
  { value: 'en', labelKey: 'settings.language.en' },
  { value: 'ja', labelKey: 'settings.language.ja' }
]

/** 用于 `<html lang>`、`toLocaleString` 等的 BCP 47 标签 */
const LOCALE_BCP47: Record<AppLocale, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP'
}

function isAppLocale(value: unknown): value is AppLocale {
  return value === 'zh' || value === 'en' || value === 'ja'
}

export function resolveAppLocale(locale: unknown): AppLocale {
  return isAppLocale(locale) ? locale : DEFAULT_LOCALE
}

export function toBcp47(locale: string): string {
  return isAppLocale(locale) ? LOCALE_BCP47[locale] : LOCALE_BCP47[DEFAULT_LOCALE]
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
