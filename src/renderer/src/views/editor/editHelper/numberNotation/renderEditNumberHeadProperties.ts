import type { Chronaxie, Measure, NoteNumber, NotesNumberInfo, SlotData } from 'deciphony-renderer'
import { AccidentalTypeEnum, BeamTypeEnum } from 'deciphony-renderer'
import {
  createAccidental,
  createAugmentationDot
} from '@renderer/dr-extensions/dr-edit/score-builder'
import {setRelativeX} from '../standardStaff/renderEditFrameProperties'

export type NumberHeadEditSlot = SlotData & {
  info: NotesNumberInfo
  note: NoteNumber
  measure: Measure
}

export const SYLLABLE_VALUES: NotesNumberInfo['syllable'][] = [1, 2, 3, 4, 5, 6, 7, 'X']

export const OCTAVE_DOT_VALUES: NotesNumberInfo['octaveDot'][] = [-2, -1, 0, 1, 2]

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

export function setNoteNumberChronaxie(note: NoteNumber, chronaxie: Chronaxie): void {
  note.chronaxie = chronaxie
}

export function setNoteNumberBeamType(note: NoteNumber, beamType: BeamTypeEnum): void {
  note.beamType = beamType
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
  info: NotesNumberInfo,
  relativeX: number,
): void {
  if (!info.accidental) return
  setRelativeX(info.accidental, relativeX)
}
