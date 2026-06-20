import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@renderer/i18n'

function defaultLoadingText() {
  return i18n.global.t('common.loading')
}

export const useGlobalLoadingStore = defineStore('globalLoading', () => {
  const visible = ref(false)
  const text = ref(defaultLoadingText())
  let depth = 0

  function show(message = defaultLoadingText()) {
    depth += 1
    text.value = message
    visible.value = true
  }

  function hide() {
    if (depth <= 0) return
    depth -= 1
    if (depth === 0) {
      visible.value = false
    }
  }

  async function run<T>(message: string, task: () => Promise<T>): Promise<T> {
    show(message)
    try {
      return await task()
    } finally {
      hide()
    }
  }

  return { visible, text, show, hide, run }
})
