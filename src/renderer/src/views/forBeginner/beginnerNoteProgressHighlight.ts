import type { VDom } from 'deciphony-renderer'
import { NOTE_PART_TAGS } from '@renderer/dr-extensions/dr-play-highlight/constants'

const PROGRESS_CLASS = 'dr-beginner-note-progress'

export type BeginnerNoteProgressState = 'current' | 'done'

export type BeginnerMidiBoxNote = {
  midi: number
  info: unknown
}

export type MidiBoxBatchPayload = {
  batchIndex: number
  notes: BeginnerMidiBoxNote[]
}

export type BeginnerNoteProgressHighlightDeps = {
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

function applyProgressClass(el: SVGElement, state: BeginnerNoteProgressState) {
  el.classList.add(PROGRESS_CLASS, `${PROGRESS_CLASS}--${state}`)
}

function removeProgressClass(el: SVGElement) {
  el.classList.remove(PROGRESS_CLASS)
  el.classList.remove(`${PROGRESS_CLASS}--current`, `${PROGRESS_CLASS}--done`)
}

/**
 * 新手模式曲谱进度高亮：通过 midiBox 回调的 note id 定位符头/符干等并着色。
 */
export function createBeginnerNoteProgressHighlight(deps: BeginnerNoteProgressHighlightDeps) {
  const stateByNoteId = new Map<string, BeginnerNoteProgressState>()
  const elementsByNoteId = new Map<string, Set<SVGElement>>()

  function unbindElements(noteId: string) {
    const els = elementsByNoteId.get(noteId)
    if (!els) return
    for (const el of els) removeProgressClass(el)
    elementsByNoteId.delete(noteId)
  }

  function bindElements(noteId: string, state: BeginnerNoteProgressState) {
    unbindElements(noteId)
    const vdoms = findNotePartVDoms(deps.getVDomList(), noteId)
    const els = new Set<SVGElement>()
    for (const vdom of vdoms) {
      const el = deps.findElementByVDom(vdom)
      if (!el) continue
      applyProgressClass(el, state)
      els.add(el)
    }
    if (els.size) elementsByNoteId.set(noteId, els)
  }

  function setNoteState(noteIdInput: unknown, state: BeginnerNoteProgressState | null) {
    const noteId = normalizeNoteId(noteIdInput)
    if (!noteId) return

    if (state == null) {
      stateByNoteId.delete(noteId)
      unbindElements(noteId)
      return
    }

    stateByNoteId.set(noteId, state)
    bindElements(noteId, state)
  }

  function markBatchDone(notes: BeginnerMidiBoxNote[]) {
    for (const note of notes) {
      setNoteState(note.info, 'done')
    }
  }

  function setCurrentBatch(notes: BeginnerMidiBoxNote[]) {
    for (const [noteId, state] of [...stateByNoteId]) {
      if (state === 'current') setNoteState(noteId, null)
    }
    for (const note of notes) {
      const noteId = normalizeNoteId(note.info)
      if (!noteId || stateByNoteId.get(noteId) === 'done') continue
      setNoteState(noteId, 'current')
    }
  }

  function clearAll() {
    for (const noteId of [...elementsByNoteId.keys()]) {
      unbindElements(noteId)
    }
    stateByNoteId.clear()
  }

  function rebindAfterRender() {
    for (const [noteId, state] of stateByNoteId) {
      bindElements(noteId, state)
    }
  }

  return {
    markBatchDone,
    setCurrentBatch,
    clearAll,
    rebindAfterRender
  }
}
