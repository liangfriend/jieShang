/**
 * ; / ' / L / O 快捷键：
 * ; 前倚音、' 后倚音（默认十六分）；选中音符加到该音，选中小节加到最后一个音。
 * L 清空目标音上的前后倚音；O 循环主音符 / 休止符时值。
 */
import {
  MusicScoreTypeEnum,
  getMeasureNoteList,
  isMeasureNoteVoices,
  isNoteRest,
  slotSymbol,
  type Chronaxie,
  type MeasureNoteSlot,
  type SlotData,
  type StaffSlot,
} from '@deciphony/renderer'
import {
  isNoteNumberSlot,
  isSlotRestLike,
  type DrumVoice,
} from '@deciphony/extensions/dr-edit/score-builder'
import {isTabNotationType} from '@renderer/utils/isTabNotation'
import {CHRONAXIE_VALUES} from './renderEditAddNoteState'
import {DRUM_CHRONAXIE_VALUES} from './drumNotation/renderEditDrumAddState'
import {
  isGraceNoteSelected,
  tryAddDrumGrace,
  tryAddNumberGrace,
  tryAddStaffGrace,
  tryAddTabGrace,
  type GracePlacement,
} from './renderEditGraceNotes'
import {isMeasureAddMode} from './standardStaff/renderEditSymbolAddAction'

type GraceHostNote = {
  graceNotes?: Array<{id: string}>
  graceNotesAfter?: Array<{id: string}>
}

type TrackInfo = {id: string; chronaxie?: Chronaxie}

type ChronaxieHolder = {chronaxie: Chronaxie}

/** O：短→长循环（chronaxie 越大越长）；对应传统 64…1，例如四分→二分 */
function noteChronaxieCycle(scoreType: MusicScoreTypeEnum): readonly Chronaxie[] {
  if (scoreType === MusicScoreTypeEnum.DrumNotation) {
    return [...DRUM_CHRONAXIE_VALUES].reverse()
  }
  return [...CHRONAXIE_VALUES].reverse()
}

function nextNoteChronaxie(current: Chronaxie, scoreType: MusicScoreTypeEnum): Chronaxie {
  const cycle = noteChronaxieCycle(scoreType)
  const idx = cycle.indexOf(current)
  if (idx < 0) return cycle.includes(64 as Chronaxie) ? (64 as Chronaxie) : cycle[0]!
  return cycle[(idx + 1) % cycle.length]!
}

function slotInfos(slot: MeasureNoteSlot): TrackInfo[] | null {
  const body = slotSymbol(slot)
  if (isNoteRest(body as StaffSlot)) return null
  if (isNoteNumberSlot(body as never) && isSlotRestLike(body as never)) return null
  const infos = (body as {notesInfo?: TrackInfo[]}).notesInfo
  return Array.isArray(infos) && infos.length > 0 ? infos : null
}

/** 选中音符头 / 倚音 → 该宿主音；选中小节 → 小节最后一个非休止符音（加倚音用） */
function resolveHostEditSlot(selected: SlotData, voice: DrumVoice): SlotData | null {
  if (selected.note && selected.info) {
    return {
      ...selected,
      self: selected.info,
    }
  }
  if (!isMeasureAddMode(selected) || !selected.measure) return null
  const notes = selected.measure.notes
  const slots = isMeasureNoteVoices(notes) ? notes[voice] ?? [] : notes
  for (let i = slots.length - 1; i >= 0; i--) {
    const slot = slots[i]!
    const infos = slotInfos(slot)
    if (!infos) continue
    const body = slotSymbol(slot)
    return {
      musicScore: selected.musicScore,
      grandStaff: selected.grandStaff,
      singleStaff: selected.singleStaff,
      measure: selected.measure,
      note: body as SlotData['note'],
      info: infos[0] as SlotData['info'],
      self: infos[0] as SlotData['self'],
    }
  }
  return null
}

function addGraceOnSlot(editSlot: SlotData, placement: GracePlacement): boolean {
  const type = editSlot.musicScore.type
  if (isTabNotationType(type)) return tryAddTabGrace(editSlot, placement) != null
  if (type === MusicScoreTypeEnum.NumberNotation) return tryAddNumberGrace(editSlot, placement) != null
  if (type === MusicScoreTypeEnum.DrumNotation) return tryAddDrumGrace(editSlot, placement) != null
  return tryAddStaffGrace(editSlot, placement) != null
}

/** ; 前倚音 / ' 后倚音 */
export function applyAddGraceShortcut(
  selected: SlotData | null,
  placement: GracePlacement,
  voice: DrumVoice,
): boolean {
  if (!selected) return false
  const host = resolveHostEditSlot(selected, voice)
  if (!host) return false
  return addGraceOnSlot(host, placement)
}

/**
 * 从记谱体取时值持有者（与音值组合 durationHolders 一致）：
 * 有 notesInfo → 整列；否则本体带 chronaxie → 休止符。
 * 勿对 NotesInfo / NotesNumberInfo 调 isSlotRestLike（无 notesInfo 会抛错）。
 */
function chronaxieHoldersFromBody(body: unknown): ChronaxieHolder[] | null {
  if (!body || typeof body !== 'object') return null
  const notesInfo = (body as {notesInfo?: ChronaxieHolder[]}).notesInfo
  if (Array.isArray(notesInfo) && notesInfo.length > 0) return notesInfo
  if (typeof (body as {chronaxie?: unknown}).chronaxie === 'number') {
    return [body as ChronaxieHolder]
  }
  return null
}

/**
 * 解析要改时值的主音符 / 休止符：
 * 选中音符（含倚音）→ 宿主主音列；选中休止符 → 该休止符；选中小节 → 最后一个音符或休止符。
 */
function resolveDurationTarget(
  selected: SlotData,
  voice: DrumVoice,
): {holders: ChronaxieHolder[]; current: Chronaxie} | null {
  // 先看宿主 note（音符头 / 倚音 / 简谱休止符都有 note）
  if (selected.note) {
    const holders = chronaxieHoldersFromBody(selected.note)
    if (holders) {
      // 倚音选中时改主音列时值，不取倚音自身 chronaxie
      const current = isGraceNoteSelected(selected)
        ? holders[0]!.chronaxie
        : selected.info && typeof (selected.info as {chronaxie?: unknown}).chronaxie === 'number'
          ? (selected.info as ChronaxieHolder).chronaxie
          : holders[0]!.chronaxie
      return {holders, current}
    }
  }

  // 五线 / TAB / 鼓 休止符：self 为休止符本体（有 chronaxie，无 notesInfo）
  if (
    selected.self &&
    selected.self !== selected.measure &&
    selected.self !== selected.note &&
    selected.self !== selected.info
  ) {
    const holders = chronaxieHoldersFromBody(selected.self)
    if (holders) return {holders, current: holders[0]!.chronaxie}
  }

  if (!isMeasureAddMode(selected) || !selected.measure) return null
  const notes = selected.measure.notes
  const slots = isMeasureNoteVoices(notes)
    ? (notes[voice]?.length ? notes[voice] : getMeasureNoteList(selected.measure)) ?? []
    : notes
  for (let i = slots.length - 1; i >= 0; i--) {
    const holders = chronaxieHoldersFromBody(slotSymbol(slots[i]!))
    if (holders) return {holders, current: holders[0]!.chronaxie}
  }
  return null
}

/**
 * O：循环主音符 / 休止符时值（不是倚音）。
 * 选中音符或休止符则改该项；选中小节则改最后一个；选中倚音则改其宿主主音。
 */
export function applyCycleNoteChronaxie(
  selected: SlotData | null,
  voice: DrumVoice,
): boolean {
  if (!selected) return false
  const target = resolveDurationTarget(selected, voice)
  if (!target) return false
  const next = nextNoteChronaxie(target.current, selected.musicScore.type)
  for (const h of target.holders) h.chronaxie = next
  return true
}

function clearGraceLists(note: GraceHostNote): boolean {
  const hadBefore = Boolean(note.graceNotes?.length)
  const hadAfter = Boolean(note.graceNotesAfter?.length)
  if (!hadBefore && !hadAfter) return false
  delete note.graceNotes
  delete note.graceNotesAfter
  return true
}

/**
 * L：清空目标音上的前 / 后倚音。
 * 选中音符或倚音 → 该宿主；选中小节 → 最后一个音。
 */
export function applyClearGraceNotes(
  selected: SlotData | null,
  voice: DrumVoice,
): boolean {
  if (!selected) return false
  const host = resolveHostEditSlot(selected, voice)
  if (!host?.note) return false
  return clearGraceLists(host.note as GraceHostNote)
}
