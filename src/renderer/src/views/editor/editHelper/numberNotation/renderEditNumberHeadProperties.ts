import type {
  Chronaxie,
  Measure,
  MusicScore,
  NoteNumber,
  NotesNumberInfo,
  SlotData,
} from '@deciphony/renderer'
import { AccidentalTypeEnum, BeamTypeEnum } from '@deciphony/renderer'
import {
  createAccidental,
  createAugmentationDot,
  createNotesNumberInfo,
} from '@deciphony/extensions/dr-edit/score-builder'
import {previewRelativeX} from '../standardStaff/renderEditFrameProperties'

export type NumberHeadEditSlot = SlotData & {
  info: NotesNumberInfo
  note: NoteNumber
  measure: Measure
}

export const SYLLABLE_VALUES: NotesNumberInfo['syllable'][] = [1, 2, 3, 4, 5, 6, 7, 'X']

export const OCTAVE_DOT_VALUES: NotesNumberInfo['octaveDot'][] = [-3, -2, -1, 0, 1, 2, 3]

export const BEAM_TYPE_VALUES: BeamTypeEnum[] = [
  BeamTypeEnum.Combined,
  BeamTypeEnum.OnlyRight,
  BeamTypeEnum.None,
]

export const ACCIDENTAL_SELECT_VALUES: (AccidentalTypeEnum | '')[] = [
  '',
  AccidentalTypeEnum.Sharp,
  AccidentalTypeEnum.Flat,
  AccidentalTypeEnum.Double_sharp,
  AccidentalTypeEnum.Double_flat,
  AccidentalTypeEnum.Natural,
]

export const AUGMENTATION_DOT_VALUES: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3]

/** 时值在 NotesNumberInfo；同 slot 各层保持一致（布局取最大） */
export function setNotesNumberInfoChronaxie(
  info: NotesNumberInfo,
  chronaxie: Chronaxie,
  note?: NoteNumber,
): void {
  info.chronaxie = chronaxie
  if (!note) return
  for (const ni of note.notesInfo) {
    ni.chronaxie = chronaxie
  }
  // 清掉旧版写在 NoteNumber 上的 chronaxie，避免与 info 层不一致
  delete (note as NoteNumber & { chronaxie?: Chronaxie }).chronaxie
}

/** 连音线类型在 NotesNumberInfo */
export function setNotesNumberInfoBeamType(
  info: NotesNumberInfo,
  beamType: BeamTypeEnum,
  note?: NoteNumber,
): void {
  info.beamType = beamType
  if (!note) return
  for (const ni of note.notesInfo) {
    ni.beamType = beamType
  }
  delete (note as NoteNumber & { beamType?: BeamTypeEnum }).beamType
}

export function setNotesNumberInfoSyllable(
  info: NotesNumberInfo,
  syllable: NotesNumberInfo['syllable']
): void {
  info.syllable = syllable
}

export function setNotesNumberInfoOctaveDot(
  info: NotesNumberInfo,
  octaveDot: NotesNumberInfo['octaveDot']
): void {
  info.octaveDot = octaveDot
}

export function setNotesNumberInfoAccidental(
  info: NotesNumberInfo,
  type: AccidentalTypeEnum | ''
): void {
  if (type === '') {
    delete info.accidental
    return
  }
  if (info.accidental) {
    info.accidental.type = type
  } else {
    info.accidental = createAccidental(type)
  }
}

export function setNotesNumberInfoAugmentationDot(
  info: NotesNumberInfo,
  count: 0 | 1 | 2 | 3
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

export function setNotesNumberInfoAccidentalRelativeX(
  musicScore: MusicScore,
  info: NotesNumberInfo,
  relativeX: number,
): void {
  if (!info.accidental) return
  previewRelativeX(musicScore, info.accidental, relativeX)
}

export function setNotesNumberInfoRelativeX(
  musicScore: MusicScore,
  info: NotesNumberInfo,
  relativeX: number,
): void {
  previewRelativeX(musicScore, info, relativeX)
}

/** 同 slot 堆叠：插到当前选中 notesInfo 后边（不是数组末尾） */
export function appendSameSlotNotesNumberInfo(
  note: NoteNumber,
  afterInfo: NotesNumberInfo,
  syllable: Exclude<NotesNumberInfo['syllable'], 0 | 'X'>,
  octaveDot: NotesNumberInfo['octaveDot'] = 0,
): NotesNumberInfo {
  const lead = note.notesInfo[0]
  const info = createNotesNumberInfo(syllable, {
    octaveDot: octaveDot ?? 0,
    chronaxie: lead?.chronaxie,
    beamType: lead?.beamType,
  })
  const at = note.notesInfo.indexOf(afterInfo)
  const insertAt = at >= 0 ? at + 1 : note.notesInfo.length
  note.notesInfo.splice(insertAt, 0, info)
  return info
}
