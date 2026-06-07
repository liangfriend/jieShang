import type { VDom } from 'deciphony-renderer'
import { NOTE_PART_TAGS } from '@renderer/dr-extensions/dr-play-highlight/constants'
import type { NoteScoreResult } from '@renderer/types/types'

const RESULT_CLASS = 'dr-practice-note-result'
const RESULT_RESULTS: NoteScoreResult[] = ['perfect', 'good', 'pass', 'early', 'late', 'miss']

export type PracticeNoteResultHighlightDeps = {
  getVDomList: () => readonly VDom[]
  findElementByVDom: (node: VDom) => SVGElement | null
}

function normalizeNoteId(noteId: unknown): string | null {
  if (noteId == null) return null
  const id = String(noteId).trim()
  return id || null
}

function findNotePartVDoms(vDomList: readonly VDom[], noteId: string): VDom[] {
  return vDomList.filter((node) => node.targetId === noteId && NOTE_PART_TAGS.has(node.tag))
}

function applyResultClass(el: SVGElement, result: NoteScoreResult) {
  el.classList.add(RESULT_CLASS, `${RESULT_CLASS}--${result}`)
}

function removeResultClass(el: SVGElement) {
  el.classList.remove(RESULT_CLASS)
  for (const result of RESULT_RESULTS) {
    el.classList.remove(`${RESULT_CLASS}--${result}`)
  }
}

/**
 * 练习模式音符评分着色：通过 vDom → findElementByVDom 定位符头/符干等顶层 g，用 filter 描边。
 */
export function createPracticeNoteResultHighlight(deps: PracticeNoteResultHighlightDeps) {
  const resultByNoteId = new Map<string, NoteScoreResult>()
  const elementsByNoteId = new Map<string, Set<SVGElement>>()

  function unbindElements(noteId: string) {
    const els = elementsByNoteId.get(noteId)
    if (!els) return
    for (const el of els) removeResultClass(el)
    elementsByNoteId.delete(noteId)
  }

  function bindElements(noteId: string, result: NoteScoreResult) {
    unbindElements(noteId)
    const vdoms = findNotePartVDoms(deps.getVDomList(), noteId)
    const els = new Set<SVGElement>()
    for (const vdom of vdoms) {
      const el = deps.findElementByVDom(vdom)
      if (!el) continue
      applyResultClass(el, result)
      els.add(el)
    }
    if (els.size) elementsByNoteId.set(noteId, els)
  }

  function applyNoteResult(noteIdInput: unknown, result: NoteScoreResult) {
    const noteId = normalizeNoteId(noteIdInput)
    if (!noteId) return
    resultByNoteId.set(noteId, result)
    bindElements(noteId, result)
  }

  function clearAll() {
    for (const noteId of [...elementsByNoteId.keys()]) {
      unbindElements(noteId)
    }
    resultByNoteId.clear()
  }

  /** vDom 重渲染后按 noteId 重新绑定 filter */
  function rebindAfterRender() {
    for (const [noteId, result] of resultByNoteId) {
      bindElements(noteId, result)
    }
  }

  /** 关闭「实时显示音符结果」时仅移除 DOM 样式，保留评分记录以便再次开启 */
  function hideAll() {
    for (const noteId of [...elementsByNoteId.keys()]) {
      unbindElements(noteId)
    }
  }

  /** 再次开启显示时恢复已有评分着色 */
  function showAll() {
    rebindAfterRender()
  }

  return {
    applyNoteResult,
    clearAll,
    rebindAfterRender,
    hideAll,
    showAll
  }
}
