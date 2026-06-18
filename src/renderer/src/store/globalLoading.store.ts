import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_TEXT = '加载中…'

export const useGlobalLoadingStore = defineStore('globalLoading', () => {
  const visible = ref(false)
  const text = ref(DEFAULT_TEXT)
  let depth = 0

  function show(message = DEFAULT_TEXT) {
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
