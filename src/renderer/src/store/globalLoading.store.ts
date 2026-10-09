import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@renderer/i18n'

function defaultLoadingText() {
  return i18n.global.t('common.loading')
}

export const useGlobalLoadingStore = defineStore('globalLoading', () => {
  const visible = ref(false)
  const text = ref(defaultLoadingText())
  /** 跳过淡入：紧接着会阻塞主线程时，淡入动画来不及播放，遮罩几乎是透明的 */
  const instant = ref(false)
  let depth = 0

  function show(message = defaultLoadingText(), options: { instant?: boolean } = {}) {
    if (depth === 0) instant.value = options.instant === true
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

  return { visible, text, instant, show, hide, run }
})
