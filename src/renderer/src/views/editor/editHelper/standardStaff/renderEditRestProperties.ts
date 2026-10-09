import type {Chronaxie, Measure, MusicScore, NoteRest, SlotData} from '@deciphony/renderer'
import {createAugmentationDot} from '@deciphony/extensions/dr-edit/score-builder'
import {previewRelativeX, setRelativeX} from './renderEditFrameProperties'

export type RestEditSlot = SlotData & {self: NoteRest; measure: Measure}

export function setNoteRestChronaxie(rest: NoteRest, chronaxie: Chronaxie): void {
  rest.chronaxie = chronaxie
}

export function setNoteRestAugmentationDot(rest: NoteRest, count: 0 | 1 | 2 | 3): void {
  if (count === 0) {
    delete rest.augmentationDot
    return
  }
  if (rest.augmentationDot) {
    rest.augmentationDot.count = count
  } else {
    rest.augmentationDot = createAugmentationDot(count)
  }
}

export function setNoteRestRelativeX(
  musicScore: MusicScore,
  rest: NoteRest,
  relativeX: number,
): void {
  previewRelativeX(musicScore, rest, relativeX)
}

/** 非滑块路径：立刻写源数据 */
export function commitNoteRestRelativeX(rest: NoteRest, relativeX: number): void {
  setRelativeX(rest, relativeX)
}
