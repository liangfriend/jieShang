import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, FALLBACK_LOCALE, loadPersistedLocale } from './locale'
import zh from './messages/zh'
import en from './messages/en'

const i18n = createI18n({
  legacy: false,
  locale: loadPersistedLocale() || DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: { zh, en }
})

export default i18n
