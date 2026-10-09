import type { MusicScore } from '@deciphony/renderer'
import { onBeforeUnmount, onMounted, type Ref, watch } from 'vue'
import {
  createScoreEditHistory,
  SCORE_EDIT_HISTORY_MAX,
  type ScoreEditHistory
} from '@renderer/utils/scoreEditHistory'

const COMMIT_DEBOUNCE_MS = 220

/** 仅真正的文本输入吞快捷键；radio/checkbox/button 等工具栏控件不吞 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) {
    const type = (target.type || 'text').toLowerCase()
    return ![
      'radio',
      'checkbox',
      'button',
      'submit',
      'reset',
      'file',
      'image',
      'hidden',
      'range',
      'color'
    ].includes(type)
  }
  return false
}

/**
 * 编辑页全量快照：深监听防抖入栈；Ctrl/Cmd+Z 撤销、Ctrl/Cmd+Y 恢复；离页清空。
 */
export function useScoreEditHistory(
  scoreRef: Ref<MusicScore>,
  options?: {
    maxSteps?: number
    /** 撤销/恢复成功后（例如目标元素已不存在时由编辑层清选中） */
    onRestored?: () => void
  }
): ScoreEditHistory {
  const history = createScoreEditHistory(options?.maxSteps ?? SCORE_EDIT_HISTORY_MAX)
  let commitTimer: ReturnType<typeof setTimeout> | null = null

  function flushCommit() {
    if (commitTimer != null) {
      clearTimeout(commitTimer)
      commitTimer = null
    }
    history.commit(scoreRef.value)
  }

  function scheduleCommit() {
    if (commitTimer != null) clearTimeout(commitTimer)
    commitTimer = setTimeout(() => {
      commitTimer = null
      history.commit(scoreRef.value)
    }, COMMIT_DEBOUNCE_MS)
  }

  function restore(kind: 'undo' | 'redo') {
    flushCommit()
    const ok = kind === 'undo' ? history.undo(scoreRef.value) : history.redo(scoreRef.value)
    if (ok) options?.onRestored?.()
    return ok
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return
    if (isEditableTarget(event.target)) return

    const key = event.key.toLowerCase()
    if (key === 'z' && !event.shiftKey) {
      event.preventDefault()
      restore('undo')
      return
    }
    if (key === 'y' || (key === 'z' && event.shiftKey)) {
      event.preventDefault()
      restore('redo')
    }
  }

  history.reset(scoreRef.value)

  watch(
    scoreRef,
    () => {
      scheduleCommit()
    },
    { deep: true }
  )

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, true)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown, true)
    if (commitTimer != null) clearTimeout(commitTimer)
    history.clear()
  })

  return history
}
