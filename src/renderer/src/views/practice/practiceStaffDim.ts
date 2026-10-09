import type { MusicScore, VDom } from '@deciphony/renderer'
import { NOTE_PART_TAGS } from '@deciphony/extensions/dr-play-highlight'
import { nextTick } from 'vue'
import { collectSingleStaffNoteIds } from '@renderer/utils/staffNotes'

const STAFF_DIM_CLASS = 'dr-practice-staff-dim'

export type PracticeStaffDimDeps = {
  getVDomList: () => readonly VDom[]
  findElementByVDom: (node: VDom) => SVGElement | null
}

function findNotePartVDoms(vDomList: readonly VDom[], noteId: string): VDom[] {
  return vDomList.filter((node) => node.targetId === noteId && NOTE_PART_TAGS.has(node.tag))
}

/**
 * 练习 / 新手 / 演唱：关闭的单谱表音符 DOM 加 opacity 0.5。
 *
 * 转调 / 升降半音 / 曲谱类型转换会改 data → musicScore 在 watch 里同步 emit renderMusicScore，
 * 此时 SVG 尚未 patch 到 DOM，立刻 bind 会失败且之后不再重试，置灰样式丢失。
 * 因此记住最近一次 sync 参数，在 nextTick（DOM 提交后）再应用。
 */
export function createPracticeStaffDim(deps: PracticeStaffDimDeps) {
  const dimmedNoteIds = new Set<string>()
  const elementsByNoteId = new Map<string, Set<SVGElement>>()

  let lastScore: MusicScore | null = null
  let lastDisabledStaffIndexes: number[] = []
  let applyScheduled = false
  let applyToken = 0

  function unbindElements(noteId: string) {
    const els = elementsByNoteId.get(noteId)
    if (!els) return
    for (const el of els) el.classList.remove(STAFF_DIM_CLASS)
    elementsByNoteId.delete(noteId)
  }

  function bindDim(noteId: string) {
    unbindElements(noteId)
    const vdoms = findNotePartVDoms(deps.getVDomList(), noteId)
    const els = new Set<SVGElement>()
    for (const vdom of vdoms) {
      const el = deps.findElementByVDom(vdom)
      if (!el) continue
      el.classList.add(STAFF_DIM_CLASS)
      els.add(el)
    }
    if (els.size) elementsByNoteId.set(noteId, els)
  }

  function clearBoundElements() {
    for (const noteId of [...elementsByNoteId.keys()]) {
      unbindElements(noteId)
    }
  }

  function clearAll() {
    applyToken += 1
    applyScheduled = false
    clearBoundElements()
    dimmedNoteIds.clear()
    lastScore = null
    lastDisabledStaffIndexes = []
  }

  function applyNow() {
    clearBoundElements()
    dimmedNoteIds.clear()
    if (!lastScore || lastDisabledStaffIndexes.length === 0) return

    for (const staffIndex of lastDisabledStaffIndexes) {
      for (const noteId of collectSingleStaffNoteIds(lastScore, staffIndex)) {
        dimmedNoteIds.add(noteId)
        bindDim(noteId)
      }
    }
  }

  /** DOM 提交后再绑；合并同一帧内多次 sync / render */
  function scheduleApply() {
    if (applyScheduled) return
    applyScheduled = true
    const token = ++applyToken
    void nextTick(() => {
      applyScheduled = false
      if (token !== applyToken) return
      applyNow()
    })
  }

  function sync(score: MusicScore, disabledStaffIndexes: readonly number[]) {
    lastScore = score
    lastDisabledStaffIndexes = [...disabledStaffIndexes]
    scheduleApply()
  }

  /** 曲谱重渲染后调用：按最近一次 sync 的谱表禁用状态重新置灰 */
  function rebindAfterRender() {
    if (!lastScore || lastDisabledStaffIndexes.length === 0) return
    scheduleApply()
  }

  return { sync, rebindAfterRender, clearAll }
}
