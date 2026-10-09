import { isMeasureNoteVoices, isNoteSymbol, slotSymbol } from '@deciphony/renderer'
import type {
  Measure,
  MeasureNoteSlot,
  MusicScore,
  NotesInfo,
  NoteSymbol,
  SingleStaff
} from '@deciphony/renderer'
import { createSlur } from '@deciphony/extensions/dr-edit/score-builder'
import { DEFAULT_SLUR_THICKNESS, adjacentStaffMeasure, setSlurThickness } from '../renderEditSlurProperties'
import { findMeasureNoteIndex } from '../asStaffOrNumber'
import type { NoteHeadEditSlot } from './renderEditNoteHeadProperties'

/** 连音线跨越的连续音符位数（含当前音符） */
export type SlurSpan = 2 | 3 | 4

export const SLUR_SPAN_OPTIONS: SlurSpan[] = [2, 3, 4]

/** 鼓谱上下声部：连音线只在音符所在声部内找终点 */
type VoiceKey = 'up' | 'down' | null

function voiceSlots(measure: Measure, voice: VoiceKey): MeasureNoteSlot[] {
  const notes = measure.notes
  if (!isMeasureNoteVoices(notes)) return notes
  return (voice ? notes[voice] : notes.up) ?? []
}

function pickNotesInfoForSlurEnd(note: NoteSymbol, voiceIndex: number): NotesInfo | null {
  if (note.notesInfo.length === 0) return null
  if (voiceIndex >= 0 && voiceIndex < note.notesInfo.length) {
    return note.notesInfo[voiceIndex]!
  }
  return note.notesInfo[0]!
}

/**
 * 从当前音符位起向右数 `slotsToRight` 个 NoteSymbol（跳过休止符）。
 * 仅搜索当前小节与下一个小节（可在下一个复谱表）；不足则返回 null。
 */
export function findNotesInfoAtRightOffset(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  startMeasureIndex: number,
  startNoteIndex: number,
  slotsToRight: number,
  voiceIndex: number,
  voice: VoiceKey = null
): NotesInfo | null {
  const note = findNoteSymbolAtRightOffset(
    musicScore,
    singleStaff,
    startMeasureIndex,
    startNoteIndex,
    slotsToRight,
    voice
  )
  return note ? pickNotesInfoForSlurEnd(note, voiceIndex) : null
}

function findNoteSymbolAtRightOffset(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  startMeasureIndex: number,
  startNoteIndex: number,
  slotsToRight: number,
  voice: VoiceKey
): NoteSymbol | null {
  if (slotsToRight <= 0) return null

  const next = adjacentStaffMeasure(musicScore, singleStaff, startMeasureIndex, 1)
  const searchSlots = [
    voiceSlots(singleStaff.measures[startMeasureIndex]!, voice).slice(startNoteIndex + 1),
    next ? voiceSlots(next.singleStaff.measures[next.measureIndex]!, voice) : [],
  ].flat()

  let remaining = slotsToRight
  for (const slot of searchSlots) {
    const body = slotSymbol(slot)
    if (!isNoteSymbol(body)) continue
    remaining -= 1
    if (remaining === 0) return body
  }
  return null
}

function findNoteInVoices(measure: Measure, note: { id?: string }): { voice: VoiceKey; index: number } {
  const notes = measure.notes
  if (!isMeasureNoteVoices(notes)) return { voice: null, index: findMeasureNoteIndex(measure, note) }
  for (const voice of ['up', 'down'] as const) {
    const index = findMeasureNoteIndex({ ...measure, notes: notes[voice] ?? [] }, note)
    if (index >= 0) return { voice, index }
  }
  return { voice: null, index: -1 }
}

function resolveNoteHeadAnchor(editSlot: NoteHeadEditSlot): {
  singleStaff: SingleStaff
  measureIndex: number
  noteIndex: number
  voice: VoiceKey
  voiceIndex: number
  startInfo: NotesInfo
} | null {
  const { singleStaff, measure, note, info } = editSlot
  if (!singleStaff || !measure || !note || !info) return null

  const measureIndex = singleStaff.measures.findIndex((m) => m.id === measure.id)
  if (measureIndex < 0) return null

  const { voice, index: noteIndex } = findNoteInVoices(measure as Measure, note)
  if (noteIndex < 0) return null

  const voiceIndex = note.notesInfo.findIndex((ni) => ni.id === info.id)
  if (voiceIndex < 0) return null

  return { singleStaff, measureIndex, noteIndex, voice, voiceIndex, startInfo: info }
}

/** 默认终点：右侧第 (span-1) 个音符里与起点同序号的音（该序号不存在取第一个） */
export function findSlurEndFromNoteHead(editSlot: NoteHeadEditSlot, span: SlurSpan): NotesInfo | null {
  const anchor = resolveNoteHeadAnchor(editSlot)
  if (!anchor) return null
  const endInfo = findNotesInfoAtRightOffset(
    editSlot.musicScore as MusicScore,
    anchor.singleStaff,
    anchor.measureIndex,
    anchor.noteIndex,
    span - 1,
    anchor.voiceIndex,
    anchor.voice
  )
  return endInfo && endInfo.id !== anchor.startInfo.id ? endInfo : null
}

/**
 * 在选中音符头与右侧第 (span-1) 个音符头之间添加连音线；当前小节剩余 + 下一小节的音符不够则失败。
 * endInfoId：终点改用同一和弦里的另一个音；不在该和弦时用默认终点。
 */
export function tryAddSlurFromNoteHead(
  editSlot: NoteHeadEditSlot,
  span: SlurSpan,
  endInfoId?: string | null,
  thickness = DEFAULT_SLUR_THICKNESS
): boolean {
  const anchor = resolveNoteHeadAnchor(editSlot)
  if (!anchor) return false

  const musicScore = editSlot.musicScore as MusicScore
  const endNote = findNoteSymbolAtRightOffset(
    musicScore,
    anchor.singleStaff,
    anchor.measureIndex,
    anchor.noteIndex,
    span - 1,
    anchor.voice
  )
  if (!endNote) return false
  const endInfo =
    endNote.notesInfo.find((ni) => ni.id === endInfoId) ??
    pickNotesInfoForSlurEnd(endNote, anchor.voiceIndex)
  if (!endInfo || endInfo.id === anchor.startInfo.id) return false

  const slur = createSlur({
    startId: anchor.startInfo.id,
    endId: endInfo.id,
  })
  setSlurThickness(slur, thickness)
  musicScore.affiliatedSymbols.push(slur)
  return true
}
