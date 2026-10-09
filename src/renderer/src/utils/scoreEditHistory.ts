import type { MusicScore } from '@deciphony/renderer'
import { applyMusicScoreInPlace } from '@renderer/utils/scoreRoute'

/** 编辑模式全量快照最大份数（不含当前） */
export const SCORE_EDIT_HISTORY_MAX = 20

function serializeScore(score: MusicScore): string {
  return JSON.stringify(score)
}

function cloneScoreFromSerialized(raw: string): MusicScore {
  return JSON.parse(raw) as MusicScore
}

/**
 * 曲谱编辑全量快照栈。
 * - commit：当前态相对上次已记录态有变化时，把「上一态」推进 past
 * - undo / redo：整谱替换；期间 suspend 避免反向写入历史
 */
export function createScoreEditHistory(maxSteps = SCORE_EDIT_HISTORY_MAX) {
  const max = Math.max(1, Math.floor(maxSteps))
  let past: string[] = []
  let future: string[] = []
  /** 当前已确认的序列化态（与 score 同步，undo/redo 后也会更新） */
  let cursor = ''
  let suspended = false

  function reset(score: MusicScore): void {
    past = []
    future = []
    cursor = serializeScore(score)
    suspended = false
  }

  function clear(): void {
    past = []
    future = []
    cursor = ''
    suspended = false
  }

  function suspend(): void {
    suspended = true
  }

  function resume(): void {
    suspended = false
  }

  /** 若谱面相对 cursor 有变化，把旧 cursor 入 past，并清空 future */
  function commit(score: MusicScore): boolean {
    if (suspended) return false
    const next = serializeScore(score)
    if (!cursor) {
      cursor = next
      return false
    }
    if (next === cursor) return false
    past.push(cursor)
    while (past.length > max) past.shift()
    cursor = next
    future = []
    return true
  }

  function canUndo(): boolean {
    return past.length > 0
  }

  function canRedo(): boolean {
    return future.length > 0
  }

  function undo(score: MusicScore): boolean {
    if (!past.length) return false
    const current = serializeScore(score)
    const prev = past.pop()!
    future.push(current)
    suspended = true
    try {
      applyMusicScoreInPlace(score, cloneScoreFromSerialized(prev))
      cursor = prev
    } finally {
      suspended = false
    }
    return true
  }

  function redo(score: MusicScore): boolean {
    if (!future.length) return false
    const current = serializeScore(score)
    const next = future.pop()!
    past.push(current)
    while (past.length > max) past.shift()
    suspended = true
    try {
      applyMusicScoreInPlace(score, cloneScoreFromSerialized(next))
      cursor = next
    } finally {
      suspended = false
    }
    return true
  }

  return {
    reset,
    clear,
    suspend,
    resume,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    get size() {
      return past.length
    }
  }
}

export type ScoreEditHistory = ReturnType<typeof createScoreEditHistory>
