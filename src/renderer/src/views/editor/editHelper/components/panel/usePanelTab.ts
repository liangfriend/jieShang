import { ref, type Ref } from 'vue'

const states = new Map<string, Ref<unknown>>()

/** 属性栏局部状态（页签、跨度等）：切换选中项、面板重建后保持上次的值 */
export function usePanelState<T>(key: string, initial: T): Ref<T> {
  let state = states.get(key) as Ref<T> | undefined
  if (!state) {
    state = ref(initial) as Ref<T>
    states.set(key, state as Ref<unknown>)
  }
  return state
}

export function usePanelTab(scope: string, defaultTab: string): Ref<string> {
  return usePanelState(`tab:${scope}`, defaultTab)
}
