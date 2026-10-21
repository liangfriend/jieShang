import type {AugmentationDot, Chronaxie, TabNote, TabNoteInfo, TabRest} from '@deciphony/renderer'
import {createAugmentationDot} from '@deciphony/extensions/dr-edit/score-builder'

export type TabDotCount = 0 | 1 | 2 | 3

function writeDot(holder: {augmentationDot?: AugmentationDot}, count: TabDotCount): void {
  if (count === 0) {
    delete holder.augmentationDot
    return
  }
  if (holder.augmentationDot) holder.augmentationDot.count = count
  else holder.augmentationDot = createAugmentationDot(count)
}

/** 同列各弦共用时值（渲染取首条），整列一起改 */
export function setTabNoteChronaxie(note: TabNote, chronaxie: Chronaxie): void {
  for (const info of note.notesInfo) info.chronaxie = chronaxie
}

/** 选中项是主音列中的一条时改整列，倚音只改自身 */
export function setTabInfoChronaxie(note: TabNote, info: TabNoteInfo, chronaxie: Chronaxie): void {
  if (note.notesInfo.includes(info)) setTabNoteChronaxie(note, chronaxie)
  else info.chronaxie = chronaxie
}

/** 同列各弦共用附点，整列一起改；0 清除 */
export function setTabNoteAugmentationDot(note: TabNote, count: TabDotCount): void {
  for (const info of note.notesInfo) writeDot(info, count)
}

/** 选中项是主音列中的一条时改整列，倚音只改自身 */
export function setTabInfoAugmentationDot(note: TabNote, info: TabNoteInfo, count: TabDotCount): void {
  if (note.notesInfo.includes(info)) setTabNoteAugmentationDot(note, count)
  else writeDot(info, count)
}

export function setTabRestChronaxie(rest: TabRest, chronaxie: Chronaxie): void {
  rest.chronaxie = chronaxie
}

export function setTabRestAugmentationDot(rest: TabRest, count: TabDotCount): void {
  writeDot(rest, count)
}
