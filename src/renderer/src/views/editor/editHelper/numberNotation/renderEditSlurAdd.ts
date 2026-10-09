import type {
  MeasureNoteSlot,
  MusicScore,
  NoteNumber,
  NotesNumberInfo,
  SingleStaff
} from '@deciphony/renderer'
import { createSlur } from '@deciphony/extensions/dr-edit/score-builder'
import { isSlotRestLike } from '@deciphony/extensions/dr-edit/score-builder'
import { DEFAULT_SLUR_THICKNESS, adjacentStaffMeasure, setSlurThickness } from '../renderEditSlurProperties'
import { findMeasureNoteIndex, asStaffOrNumber, isHostNoteNumberSlot } from '../asStaffOrNumber'

import type { NumberHeadEditSlot } from './renderEditNumberHeadProperties'

export type SlurSpan = 2 | 3 | 4

export const SLUR_SPAN_OPTIONS: SlurSpan[] = [2, 3, 4]

function pickNotesNumberInfoForSlurEnd(
  note: NoteNumber,
  voiceIndex: number
): NotesNumberInfo | null {
  if (note.notesInfo.length === 0) return null
  if (voiceIndex >= 0 && voiceIndex < note.notesInfo.length) {
    return note.notesInfo[voiceIndex]!
  }
  return note.notesInfo[0]!
}

/** 只在当前小节剩余与下一小节（可在下一个复谱表）里找，跳过休止符；不足则返回 null */
export function findNotesNumberInfoAtRightOffset(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  startMeasureIndex: number,
  startNoteIndex: number,
  slotsToRight: number,
  voiceIndex: number
): NotesNumberInfo | null {
  const note = findNoteNumberAtRightOffset(
    musicScore,
    singleStaff,
    startMeasureIndex,
    startNoteIndex,
    slotsToRight
  )
  return note ? pickNotesNumberInfoForSlurEnd(note, voiceIndex) : null
}

function findNoteNumberAtRightOffset(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  startMeasureIndex: number,
  startNoteIndex: number,
  slotsToRight: number
): NoteNumber | null {
  if (slotsToRight <= 0) return null

  const next = adjacentStaffMeasure(musicScore, singleStaff, startMeasureIndex, 1)
  const searchSlots = [
    (singleStaff.measures[startMeasureIndex]!.notes as MeasureNoteSlot[]).slice(startNoteIndex + 1),
    next ? (next.singleStaff.measures[next.measureIndex]!.notes as MeasureNoteSlot[]) : [],
  ].flat()

  let remaining = slotsToRight
  for (const raw of searchSlots) {
    const slot = asStaffOrNumber(raw)
    if (!isHostNoteNumberSlot(slot) || isSlotRestLike(slot)) continue
    remaining -= 1
    if (remaining === 0) return slot
  }
  return null
}

function resolveNumberHeadAnchor(editSlot: NumberHeadEditSlot): {
  singleStaff: SingleStaff
  measureIndex: number
  noteIndex: number
  voiceIndex: number
  startInfo: NotesNumberInfo
} | null {
  const { singleStaff, measure, note, info } = editSlot
  if (!singleStaff || !measure || !note || !info) return null

  // 用 id 定位，避免响应式代理导致 indexOf 找不到
  const measureIndex = singleStaff.measures.findIndex((m) => m.id === measure.id)
  if (measureIndex < 0) return null

  const noteIndex = findMeasureNoteIndex(measure, note)
  if (noteIndex < 0) return null

  const voiceIndex = note.notesInfo.findIndex((ni) => ni.id === info.id)
  if (voiceIndex < 0) return null

  return { singleStaff, measureIndex, noteIndex, voiceIndex, startInfo: info }
}

/** 默认终点：右侧第 (span-1) 个音符位里与起点同层的音（该层不存在取最下层） */
export function findSlurEndFromNumberHead(
  editSlot: NumberHeadEditSlot,
  span: SlurSpan
): NotesNumberInfo | null {
  const anchor = resolveNumberHeadAnchor(editSlot)
  if (!anchor) return null
  const endInfo = findNotesNumberInfoAtRightOffset(
    editSlot.musicScore as MusicScore,
    anchor.singleStaff,
    anchor.measureIndex,
    anchor.noteIndex,
    span - 1,
    anchor.voiceIndex
  )
  return endInfo && endInfo.id !== anchor.startInfo.id ? endInfo : null
}

/** endInfoId：终点改用同一列的另一层音（如 7 连到上层的 7）；不在该列时用默认终点 */
export function tryAddSlurFromNumberHead(
  editSlot: NumberHeadEditSlot,
  span: SlurSpan,
  endInfoId?: string | null,
  thickness = DEFAULT_SLUR_THICKNESS
): boolean {
  const anchor = resolveNumberHeadAnchor(editSlot)
  if (!anchor) return false

  const musicScore = editSlot.musicScore as MusicScore
  const endNote = findNoteNumberAtRightOffset(
    musicScore,
    anchor.singleStaff,
    anchor.measureIndex,
    anchor.noteIndex,
    span - 1
  )
  if (!endNote) return false
  const endInfo =
    endNote.notesInfo.find((ni) => ni.id === endInfoId) ??
    pickNotesNumberInfoForSlurEnd(endNote, anchor.voiceIndex)
  if (!endInfo || endInfo.id === anchor.startInfo.id) return false

  // 勿把 partial.data 摊到顶层，否则会覆盖掉默认 relative* 点
  const slur = createSlur({
    startId: anchor.startInfo.id,
    endId: endInfo.id,
  })
  setSlurThickness(slur, thickness)
  musicScore.affiliatedSymbols.push(slur)
  return true
}
