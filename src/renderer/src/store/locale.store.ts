import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import i18n from '@renderer/i18n'
import {
  DEFAULT_LOCALE,
  loadPersistedLocale,
  persistLocale,
  type AppLocale
} from '@renderer/i18n/locale'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<AppLocale>(loadPersistedLocale())

  function applyLocale(next: AppLocale) {
    locale.value = next
    i18n.global.locale.value = next
    persistLocale(next)
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }

  function setLocale(next: AppLocale) {
    if (locale.value === next) return
    applyLocale(next)
  }

  function init() {
    applyLocale(loadPersistedLocale())
  }

  watch(locale, (value) => {
    if (i18n.global.locale.value !== value) {
      i18n.global.locale.value = value
    }
  })

  return {
    locale,
    init,
    setLocale,
    applyLocale
  }
})

export function initAppLocale(): AppLocale {
  const initial = loadPersistedLocale()
  i18n.global.locale.value = initial
  document.documentElement.lang = initial === 'zh' ? 'zh-CN' : 'en'
  return initial
}
