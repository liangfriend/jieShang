import type { SJW, SPage } from '@deciphony/work'
import { toRaw } from 'vue'

/** 作品编辑快照最大步数（不含当前） */
export const WORK_EDIT_HISTORY_MAX = 30

/** 一页一段 JSON；内容相同的页在各条历史间复用同一个字符串，不重复占内存 */
type PageStrings = string[]

type WorkHistoryEntry = {
  pages: PageStrings
  /** 这一步改动所在页（撤销 / 恢复后跳过去） */
  changedPage: number
}

export type WorkHistoryStep = {
  from: PageStrings
  to: PageStrings
  changedPage: number
}

function serializePages(work: SJW, reuse: PageStrings | null): PageStrings {
  const known = new Map<string, string>()
  for (const s of reuse ?? []) known.set(s, s)
  // 只快照 pages：资源文件不在 data 里（只存 id），name / author / assetNames 不参与撤销
  return toRaw(work).pages.map((page) => {
    const s = JSON.stringify(toRaw(page))
    return known.get(s) ?? s
  })
}

function firstChangedPage(a: PageStrings, b: PageStrings): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i
  }
  return a.length === b.length ? -1 : n
}

/** 把 pages 换成快照内容；内容没变的页沿用原对象，避免整页重渲染 */
export function applyWorkPages(work: SJW, from: PageStrings, to: PageStrings): void {
  const current = new Map<string, SPage>()
  from.forEach((s, i) => {
    const page = work.pages[i]
    if (page) current.set(s, page)
  })
  const next = to.map((s) => current.get(s) ?? (JSON.parse(s) as SPage))
  work.pages.splice(0, work.pages.length, ...next)
}

/**
 * 作品编辑快照栈（只记 pages）。
 * - commit：相对上次记录有变化时把旧态推入 past，清空 future
 * - undo / redo：只移动栈并返回要应用的快照，由宿主 applyWorkPages 后再 rebase
 * - commit / reset 丢弃了历史时返回 discarded，宿主据此清理不再被引用的已删资源
 */
export function createWorkEditHistory(maxSteps = WORK_EDIT_HISTORY_MAX) {
  const max = Math.max(1, Math.floor(maxSteps))
  let past: WorkHistoryEntry[] = []
  let future: WorkHistoryEntry[] = []
  let cursor: PageStrings | null = null

  function reset(work: SJW): void {
    past = []
    future = []
    cursor = serializePages(work, null)
  }

  function clear(): void {
    past = []
    future = []
    cursor = null
  }

  /** 以当前数据为准重设 cursor，不入栈（应用快照后组件可能补写字段） */
  function rebase(work: SJW): void {
    if (!cursor) return
    cursor = serializePages(work, cursor)
  }

  function commit(work: SJW): { changed: boolean; discarded: boolean } {
    if (!cursor) {
      cursor = serializePages(work, null)
      return { changed: false, discarded: false }
    }
    const next = serializePages(work, cursor)
    const changedPage = firstChangedPage(cursor, next)
    if (changedPage < 0) return { changed: false, discarded: false }
    let discarded = future.length > 0
    past.push({ pages: cursor, changedPage })
    while (past.length > max) {
      past.shift()
      discarded = true
    }
    future = []
    cursor = next
    return { changed: true, discarded }
  }

  function undo(): WorkHistoryStep | null {
    const entry = past.pop()
    if (!entry || !cursor) return null
    future.push({ pages: cursor, changedPage: entry.changedPage })
    const step = { from: cursor, to: entry.pages, changedPage: entry.changedPage }
    cursor = entry.pages
    return step
  }

  function redo(): WorkHistoryStep | null {
    const entry = future.pop()
    if (!entry || !cursor) return null
    past.push({ pages: cursor, changedPage: entry.changedPage })
    const step = { from: cursor, to: entry.pages, changedPage: entry.changedPage }
    cursor = entry.pages
    return step
  }

  /** 资源 id 是否仍出现在当前态或任一历史快照里 */
  function referencesAsset(id: string): boolean {
    const needle = JSON.stringify(id)
    const seen = new Set<string>()
    const lists = [cursor ?? [], ...past.map((e) => e.pages), ...future.map((e) => e.pages)]
    for (const list of lists) {
      for (const s of list) {
        if (seen.has(s)) continue
        seen.add(s)
        if (s.includes(needle)) return true
      }
    }
    return false
  }

  return {
    reset,
    clear,
    rebase,
    commit,
    undo,
    redo,
    referencesAsset,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0
  }
}

export type WorkEditHistory = ReturnType<typeof createWorkEditHistory>
