import type {Chronaxie, Measure, NoteSymbol, NotesInfo, SlotData} from 'deciphony-renderer'
import {AccidentalTypeEnum, BeamTypeEnum, ClefTypeEnum} from 'deciphony-renderer'
import {createAccidental, createAugmentationDot, createClef} from '@renderer/dr-extensions/dr-edit/score-builder'
import {CLEF_VALUES} from '../renderEditMeasureProperties'
import {setRelativeX} from './renderEditFrameProperties'

export type NoteHeadEditSlot = SlotData & {info: NotesInfo; note: NoteSymbol; measure: Measure}

export const BEAM_TYPE_VALUES: BeamTypeEnum[] = [
  BeamTypeEnum.Combined,
  BeamTypeEnum.OnlyRight,
  BeamTypeEnum.None,
]

export const STEM_DIRECTION_VALUES: ('up' | 'down')[] = ['up', 'down']

export const ACCIDENTAL_VALUES: AccidentalTypeEnum[] = [
  AccidentalTypeEnum.Sharp,
  AccidentalTypeEnum.Flat,
  AccidentalTypeEnum.Double_sharp,
  AccidentalTypeEnum.Double_flat,
  AccidentalTypeEnum.Natural,
]

/** 变音符号选择器选项（含「无」= 删除 accidental） */
export const ACCIDENTAL_SELECT_VALUES: (AccidentalTypeEnum | '')[] = ['', ...ACCIDENTAL_VALUES]

export const AUGMENTATION_DOT_VALUES: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3]

/** 音符前谱号选择器（含「无」= 删除 note.clef） */
export const NOTE_CLEF_SELECT_VALUES: (ClefTypeEnum | '')[] = ['', ...CLEF_VALUES]

export function setNoteClef(note: NoteSymbol, type: ClefTypeEnum | ''): void {
  if (type === '') {
    delete note.clef
    return
  }
  if (note.clef) {
    note.clef.type = type
  } else {
    note.clef = createClef(type)
  }
}

export function setNotesInfoChronaxie(info: NotesInfo, chronaxie: Chronaxie): void {
  info.chronaxie = chronaxie
}

export function setNotesInfoBeamType(info: NotesInfo, beamType: BeamTypeEnum): void {
  info.beamType = beamType
}

export function setNotesInfoDirection(info: NotesInfo, direction: 'up' | 'down'): void {
  info.direction = direction
}

export function setNotesInfoAccidental(info: NotesInfo, type: AccidentalTypeEnum | ''): void {
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

export function setNotesInfoAugmentationDot(info: NotesInfo, count: 0 | 1 | 2 | 3): void {
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

export function setNotesInfoRelativeX(info: NotesInfo, relativeX: number): void {
  setRelativeX(info, relativeX)
}

export function setNoteClefRelativeX(note: NoteSymbol, relativeX: number): void {
  if (!note.clef) return
  setRelativeX(note.clef, relativeX)
}

export function setNotesInfoAccidentalRelativeX(info: NotesInfo, relativeX: number): void {
  if (!info.accidental) return
  setRelativeX(info.accidental, relativeX)
}
