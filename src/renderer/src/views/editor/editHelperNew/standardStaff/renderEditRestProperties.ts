import type {Chronaxie, Measure, NoteRest, SlotData} from 'deciphony-renderer'
import {createAugmentationDot} from '@renderer/dr-extensions/dr-edit/score-builder'
import {setRelativeX} from './renderEditFrameProperties'

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

export function setNoteRestRelativeX(rest: NoteRest, relativeX: number): void {
  setRelativeX(rest, relativeX)
}
