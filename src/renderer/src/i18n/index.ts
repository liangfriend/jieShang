import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import zh from '../locales/zh.json'
import jp from '../locales/jp.json'

const messages = {
  en,
  zh
}

const i18n = createI18n({
  locale: 'zh', // 设置默认语言
  fallbackLocale: 'en', // 设置备用语言
  messages // 设置语言翻译
})

export default i18n
