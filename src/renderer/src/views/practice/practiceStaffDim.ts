import type { MusicScore, VDom } from 'deciphony-renderer'
import { NOTE_PART_TAGS } from '@renderer/dr-extensions/dr-play-highlight/constants'
import { collectSingleStaffNoteIds } from '@renderer/views/practice/staffNotes'

const STAFF_DIM_CLASS = 'dr-practice-staff-dim'

export type PracticeStaffDimDeps = {
  getVDomList: () => readonly VDom[]
  findElementByVDom: (node: VDom) => SVGElement | null
}

function findNotePartVDoms(vDomList: readonly VDom[], noteId: string): VDom[] {
  return vDomList.filter((node) => node.targetId === noteId && NOTE_PART_TAGS.has(node.tag))
}

/**
 * 练习模式声部选择：关闭的单谱表音符 DOM 加 opacity 0.5。
 */
export function createPracticeStaffDim(deps: PracticeStaffDimDeps) {
  const dimmedNoteIds = new Set<string>()
  const elementsByNoteId = new Map<string, Set<SVGElement>>()

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

  function clearAll() {
    for (const noteId of [...elementsByNoteId.keys()]) {
      unbindElements(noteId)
    }
    dimmedNoteIds.clear()
  }

  function sync(score: MusicScore, disabledStaffIndexes: readonly number[]) {
    clearAll()
    for (const staffIndex of disabledStaffIndexes) {
      for (const noteId of collectSingleStaffNoteIds(score, staffIndex)) {
        dimmedNoteIds.add(noteId)
        bindDim(noteId)
      }
    }
  }

  function rebindAfterRender() {
    if (dimmedNoteIds.size === 0) return
    const noteIds = [...dimmedNoteIds]
    for (const noteId of [...elementsByNoteId.keys()]) {
      unbindElements(noteId)
    }
    for (const noteId of noteIds) {
      bindDim(noteId)
    }
  }

  return { sync, rebindAfterRender, clearAll }
}
