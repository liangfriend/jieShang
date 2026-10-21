import type { SJW } from '@deciphony/work'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  createWorkEditHistory,
  type WorkHistoryStep
} from '@renderer/utils/workEditHistory'

/** 停止变化多久后记一步；按住指针期间不记，松手再记，一次拖拽 = 一步 */
const COMMIT_DEBOUNCE_MS = 250

/**
 * SJWPDF 资源接口。restoreRemovedAssets / listRemovedAssetIds / purgeRemovedAssets
 * 只有带回收站的 @deciphony/work 才有，旧版缺失时跳过。
 */
export type WorkHistoryAssetApi = {
  isAssetUsed: (id: string) => boolean
  removeAsset: (id: string) => boolean
  restoreRemovedAssets?: () => string[]
  listRemovedAssetIds?: () => string[]
  purgeRemovedAssets?: (keep?: (id: string) => boolean) => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el?.closest?.('input, textarea, select, [contenteditable="true"]')
}

/**
 * 作品编辑撤销 / 恢复：Ctrl/Cmd+Z 撤销，Ctrl/Cmd+Y 或 Ctrl/Cmd+Shift+Z 恢复。
 * 指针松开、键盘松开、表单输入后防抖记一步；宿主异步改数据结束时调 checkpoint。
 */
export function useWorkEditHistory(options: {
  getWork: () => SJW | null
  getAssetApi: () => WorkHistoryAssetApi | null
  /** 是否允许撤销 / 恢复（编辑模式且不忙） */
  canEdit: () => boolean
  /** 把快照应用到作品并切到改动页 */
  applyStep: (step: WorkHistoryStep) => Promise<void>
}) {
  const history = createWorkEditHistory()
  const canUndo = ref(false)
  const canRedo = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  let pointerHeld = false
  let restoring = false
  /** 撤销时从回收站移回的资源；之后若又没人引用（如恢复了删除），再放回回收站 */
  const restoredAssetIds = new Set<string>()

  function syncFlags() {
    canUndo.value = history.canUndo()
    canRedo.value = history.canRedo()
  }

  function cancelTimer() {
    if (timer == null) return
    clearTimeout(timer)
    timer = null
  }

  function purgeUnreferencedAssets() {
    const api = options.getAssetApi()
    if (!api?.purgeRemovedAssets || !api.listRemovedAssetIds?.().length) return
    api.purgeRemovedAssets((id) => history.referencesAsset(id))
  }

  function checkpoint() {
    cancelTimer()
    if (restoring) return
    const work = options.getWork()
    if (!work) return
    const { changed, discarded } = history.commit(work)
    if (changed) syncFlags()
    if (discarded) purgeUnreferencedAssets()
  }

  function scheduleCommit() {
    cancelTimer()
    timer = setTimeout(() => {
      timer = null
      if (!pointerHeld) checkpoint()
    }, COMMIT_DEBOUNCE_MS)
  }

  /** 载入 / 导入后以当前作品为起点，丢弃之前的历史 */
  function reset() {
    cancelTimer()
    restoredAssetIds.clear()
    const work = options.getWork()
    if (work) history.reset(work)
    else history.clear()
    syncFlags()
  }

  function syncRestoredAssets() {
    const api = options.getAssetApi()
    if (!api) return
    for (const id of api.restoreRemovedAssets?.() ?? []) restoredAssetIds.add(id)
    for (const id of [...restoredAssetIds]) {
      if (api.isAssetUsed(id)) continue
      api.removeAsset(id)
      restoredAssetIds.delete(id)
    }
  }

  async function restore(kind: 'undo' | 'redo'): Promise<boolean> {
    if (restoring || !options.canEdit()) return false
    checkpoint()
    const step = kind === 'undo' ? history.undo() : history.redo()
    if (!step) return false
    restoring = true
    try {
      await options.applyStep(step)
      syncRestoredAssets()
      const work = options.getWork()
      if (work) history.rebase(work)
    } finally {
      restoring = false
      syncFlags()
    }
    return true
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return
    if (isTypingTarget(event.target) || !options.canEdit()) return
    const key = event.key.toLowerCase()
    if (key === 'z' && !event.shiftKey) {
      event.preventDefault()
      void restore('undo')
    } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
      event.preventDefault()
      void restore('redo')
    }
  }

  function onPointerDown() {
    pointerHeld = true
  }

  function onPointerUp() {
    pointerHeld = false
    scheduleCommit()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('pointercancel', onPointerUp, true)
    window.addEventListener('keyup', scheduleCommit, true)
    window.addEventListener('input', scheduleCommit, true)
    window.addEventListener('change', scheduleCommit, true)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('pointerdown', onPointerDown, true)
    window.removeEventListener('pointerup', onPointerUp, true)
    window.removeEventListener('pointercancel', onPointerUp, true)
    window.removeEventListener('keyup', scheduleCommit, true)
    window.removeEventListener('input', scheduleCommit, true)
    window.removeEventListener('change', scheduleCommit, true)
    cancelTimer()
    history.clear()
  })

  return {
    canUndo,
    canRedo,
    undo: () => restore('undo'),
    redo: () => restore('redo'),
    checkpoint,
    reset
  }
}
