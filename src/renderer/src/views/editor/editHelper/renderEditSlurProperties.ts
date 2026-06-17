import {isNoteRest, isNoteSymbol} from 'deciphony-renderer'
import type {
  DoubleNoteAffiliatedSymbol,
  MusicScore,
  NoteNumber,
  SingleStaff,
  SlotData,
  StaffSlot,
} from 'deciphony-renderer'
import {
  locateNotesInfoById,
  locateNotesNumberInfoById,
} from '@renderer/dr-extensions/dr-edit/score-builder/locate'
import {isNoteNumberSlot, isSlotRestLike} from '@renderer/dr-extensions/dr-edit/score-builder/noteSlot'

export type SlurEditSlot = SlotData & {self: DoubleNoteAffiliatedSymbol}

type SlurEndAnchor = {
  singleStaff: SingleStaff
  measureIndex: number
  noteIndex: number
}

function isRestSlot(slot: StaffSlot | NoteNumber): boolean {
  if (isNoteRest(slot)) return true
  return isNoteNumberSlot(slot) && isSlotRestLike(slot)
}

function firstInfoIdOfSlot(slot: StaffSlot | NoteNumber): string | null {
  if (isNoteRest(slot)) return null
  if (isNoteSymbol(slot)) return slot.notesInfo[0]?.id ?? null
  if (isNoteNumberSlot(slot)) {
    if (isSlotRestLike(slot)) return null
    return slot.notesInfo[0]?.id ?? null
  }
  return null
}

function locateSlurEndAnchor(musicScore: MusicScore, endId: string): SlurEndAnchor | null {
  const standard = locateNotesInfoById(musicScore, endId)
  if (standard) {
    return {
      singleStaff: standard.singleStaff,
      measureIndex: standard.measureIndex,
      noteIndex: standard.noteIndex,
    }
  }
  const jianpu = locateNotesNumberInfoById(musicScore, endId)
  if (jianpu) {
    return {
      singleStaff: jianpu.singleStaff,
      measureIndex: jianpu.measureIndex,
      noteIndex: jianpu.noteIndex,
    }
  }
  return null
}

/** 前一个音符位的 notesInfo[0]；遇休止符或越界则 null */
function findPreviousNoteInfoId(
  singleStaff: SingleStaff,
  measureIndex: number,
  noteIndex: number,
): string | null {
  let mi = measureIndex
  let ni = noteIndex - 1

  for (;;) {
    while (ni < 0) {
      mi -= 1
      if (mi < 0) return null
      ni = singleStaff.measures[mi]!.notes.length - 1
    }

    const slot = singleStaff.measures[mi]!.notes[ni]!
    if (isRestSlot(slot)) return null
    const infoId = firstInfoIdOfSlot(slot)
    if (infoId) return infoId
    ni -= 1
  }
}

/** 后一个音符位的 notesInfo[0]；遇休止符或越界则 null */
function findNextNoteInfoId(
  singleStaff: SingleStaff,
  measureIndex: number,
  noteIndex: number,
): string | null {
  let mi = measureIndex
  let ni = noteIndex + 1

  for (;;) {
    if (mi >= singleStaff.measures.length) return null
    const measure = singleStaff.measures[mi]!

    if (ni >= measure.notes.length) {
      mi += 1
      ni = 0
      continue
    }

    const slot = measure.notes[ni]!
    if (isRestSlot(slot)) return null
    const infoId = firstInfoIdOfSlot(slot)
    if (infoId) return infoId
    ni += 1
  }
}

export function canMoveSlurEndEarlier(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false
  const prevId = findPreviousNoteInfoId(anchor.singleStaff, anchor.measureIndex, anchor.noteIndex)
  return prevId != null && prevId !== slur.startId
}

export function canMoveSlurEndLater(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false
  return findNextNoteInfoId(anchor.singleStaff, anchor.measureIndex, anchor.noteIndex) != null
}

/** 尾部前移：endId → 前一音符 notesInfo[0]，直到前一为 startId 或休止符 */
export function moveSlurEndEarlier(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false

  const prevId = findPreviousNoteInfoId(anchor.singleStaff, anchor.measureIndex, anchor.noteIndex)
  if (!prevId || prevId === slur.startId) return false

  slur.endId = prevId
  return true
}

/** 尾部后移：endId → 后一音符 notesInfo[0]，直到单谱表末音或休止符 */
export function moveSlurEndLater(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false

  const nextId = findNextNoteInfoId(anchor.singleStaff, anchor.measureIndex, anchor.noteIndex)
  if (!nextId) return false

  slur.endId = nextId
  return true
}
