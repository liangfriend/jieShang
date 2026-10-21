import type {
  AugmentationDot,
  Chronaxie,
  DrumNote,
  DrumNotesInfo,
  NoteNumber,
  NotesInfo,
  NotesNumberInfo,
  NoteSymbol,
  SlotData,
  TabNote,
  TabNoteInfo,
} from '@deciphony/renderer'
import {BeamTypeEnum, isNoteSymbol} from '@deciphony/renderer'
import {
  createAugmentationDot,
  createDrumNotesInfo,
  createNotesInfo,
  createNotesNumberInfo,
} from '@deciphony/extensions/dr-edit/score-builder'
import {createTabNoteInfo, isDrumNotesInfo, isTabHeadInfo, tabStringCount} from '@deciphony/extensions/dr-edit'
import {asStaffOrNumber, isHostNoteNumberSlot} from './asStaffOrNumber'

/** 前倚音 / 后倚音 */
export type GracePlacement = 'before' | 'after'

/** 倚音默认时值：十六分 */
export const DEFAULT_GRACE_CHRONAXIE: Chronaxie = 16

function graceKey(placement: GracePlacement): 'graceNotes' | 'graceNotesAfter' {
  return placement === 'before' ? 'graceNotes' : 'graceNotesAfter'
}

/** 选中 info 是否为该 note 的前后倚音 */
export function resolveGracePlacement(
  note: {graceNotes?: Array<{id: string}>; graceNotesAfter?: Array<{id: string}>} | null | undefined,
  infoId: string | null | undefined,
): GracePlacement | null {
  if (!note || !infoId) return null
  if (note.graceNotes?.some((g) => g.id === infoId)) return 'before'
  if (note.graceNotesAfter?.some((g) => g.id === infoId)) return 'after'
  return null
}

/** 当前选中是否为倚音（五线 / 简谱 / TAB 通用） */
export function isGraceNoteSelected(selected: SlotData | null): boolean {
  if (!selected?.note || !selected.info || selected.self !== selected.info) return false
  return resolveGracePlacement(selected.note as {graceNotes?: Array<{id: string}>}, selected.info.id) != null
}

export function listGraceNotes<T extends {id: string}>(
  note: {graceNotes?: T[]; graceNotesAfter?: T[]} | null | undefined,
  placement: GracePlacement,
): T[] {
  if (!note) return []
  return note[graceKey(placement)] ?? []
}

export function removeGraceById(
  note: {graceNotes?: Array<{id: string}>; graceNotesAfter?: Array<{id: string}>},
  graceId: string,
): boolean {
  for (const key of ['graceNotes', 'graceNotesAfter'] as const) {
    const list = note[key]
    if (!list?.length) continue
    const idx = list.findIndex((g) => g.id === graceId)
    if (idx < 0) continue
    list.splice(idx, 1)
    if (list.length === 0) delete note[key]
    return true
  }
  return false
}

/** 五线：在当前音符头同 region 追加前/后倚音 */
export function tryAddStaffGrace(
  editSlot: SlotData,
  placement: GracePlacement,
): NotesInfo | null {
  const note = editSlot.note
  const info = editSlot.info as NotesInfo | null
  if (!note || !info || !isNoteSymbol(note as NoteSymbol)) return null
  const body = note as NoteSymbol
  const grace = createNotesInfo({
    region: info.region,
    chronaxie: DEFAULT_GRACE_CHRONAXIE,
    direction: info.direction,
    beamType: BeamTypeEnum.Combined,
  })
  const key = graceKey(placement)
  if (!body[key]) body[key] = []
  body[key]!.push(grace)
  return grace
}

/** 简谱：复制唱名/八度点，追加前/后倚音 */
export function tryAddNumberGrace(
  editSlot: SlotData,
  placement: GracePlacement,
): NotesNumberInfo | null {
  const note = editSlot.note
  const info = editSlot.info as NotesNumberInfo | null
  if (!note || !info) return null
  const body = asStaffOrNumber(note as never)
  if (!isHostNoteNumberSlot(body)) return null
  const grace = createNotesNumberInfo(info.syllable, {
    octaveDot: info.octaveDot,
    chronaxie: DEFAULT_GRACE_CHRONAXIE,
    beamType: BeamTypeEnum.Combined,
    accidental: info.accidental?.type,
  })
  const key = graceKey(placement)
  const host = note as NoteNumber
  if (!host[key]) host[key] = []
  host[key]!.push(grace)
  return grace
}

/** TAB：仅标准音/泛音可加倚音 */
export function tryAddTabGrace(
  editSlot: SlotData,
  placement: GracePlacement,
): TabNoteInfo | null {
  const note = editSlot.note as TabNote | null
  const info = editSlot.info as TabNoteInfo | null
  if (!note || !info || !isTabHeadInfo(info)) return null
  const stringCount = tabStringCount(editSlot.musicScore.type)
  const grace = createTabNoteInfo({
    kind: info.type === 'harmonic' ? 'harmonic' : 'normal',
    region: info.region,
    value: info.value,
    chronaxie: DEFAULT_GRACE_CHRONAXIE,
    beamType: BeamTypeEnum.Combined,
    stringCount,
  })
  const key = graceKey(placement)
  if (!note[key]) note[key] = []
  note[key]!.push(grace)
  return grace
}

/** 鼓谱：同线位、同符头追加前/后倚音 */
export function tryAddDrumGrace(
  editSlot: SlotData,
  placement: GracePlacement,
): DrumNotesInfo | null {
  const note = editSlot.note as unknown as DrumNote | null
  const info = editSlot.info as unknown
  if (!note || !isDrumNotesInfo(info)) return null
  const grace = createDrumNotesInfo({
    region: info.region,
    headType: info.headType,
    chronaxie: DEFAULT_GRACE_CHRONAXIE,
    beamType: BeamTypeEnum.Combined,
  })
  const key = graceKey(placement)
  if (!note[key]) note[key] = []
  note[key]!.push(grace)
  return grace
}

export function setGraceChronaxie(
  info: {chronaxie: Chronaxie},
  chronaxie: Chronaxie,
): void {
  info.chronaxie = chronaxie
}

export function setGraceBeamType(
  info: {beamType?: BeamTypeEnum},
  beamType: BeamTypeEnum,
): void {
  info.beamType = beamType
}

/** 五线倚音符杠方向；简谱 / TAB 无 direction 字段时忽略 */
export function setGraceDirection(
  info: {direction?: 'up' | 'down'},
  direction: 'up' | 'down',
): void {
  if (!('direction' in info)) return
  info.direction = direction
}

export function setGraceAugmentationDot(
  info: {augmentationDot?: AugmentationDot},
  count: 0 | 1 | 2 | 3,
): void {
  if (count === 0) {
    delete info.augmentationDot
    return
  }
  if (info.augmentationDot) {
    info.augmentationDot.count = count
  } else {
    info.augmentationDot = createAugmentationDot(count)
  }
}
