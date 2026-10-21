import { DrumHeadTypeEnum } from '@deciphony/renderer'
import type { Chronaxie } from '@deciphony/renderer'
import { DRUM_MAX_CHRONAXIE, type DrumVoice } from '@deciphony/extensions/dr-edit'
import { CHRONAXIE_VALUES } from '../renderEditAddNoteState'

export type DrumAddKind = 'note' | 'rest'

/** 小节添加模式：待插入的鼓谱符号 */
export type AddDrumState = {
  /** up = 一声部（符干向上），down = 二声部（符干向下） */
  voice: DrumVoice
  kind: DrumAddKind
  headType: DrumHeadTypeEnum
  chronaxie: Chronaxie
  /** 附点个数，0 为无 */
  dot: 0 | 1 | 2
}

export const DEFAULT_ADD_DRUM_STATE: AddDrumState = {
  voice: 'up',
  kind: 'note',
  headType: DrumHeadTypeEnum.Normal,
  chronaxie: 32,
  dot: 0
}

/** `labelKey` 为 i18n key，由组件 `t()` 翻译 */
export const DRUM_VOICE_OPTIONS: { value: DrumVoice; labelKey: string }[] = [
  { value: 'up', labelKey: 'editor.drum.voiceUp' },
  { value: 'down', labelKey: 'editor.drum.voiceDown' }
]

export const DRUM_ADD_KIND_OPTIONS: { value: DrumAddKind; labelKey: string }[] = [
  { value: 'note', labelKey: 'editor.addNote.note' },
  { value: 'rest', labelKey: 'editor.addNote.rest' }
]

export const DRUM_HEAD_OPTIONS: { value: DrumHeadTypeEnum; labelKey: string }[] = [
  { value: DrumHeadTypeEnum.Normal, labelKey: 'editor.drum.headType.normal' },
  { value: DrumHeadTypeEnum.Cross, labelKey: 'editor.drum.headType.cross' },
  { value: DrumHeadTypeEnum.CircledCross, labelKey: 'editor.drum.headType.circledCross' },
  { value: DrumHeadTypeEnum.CircledSlash, labelKey: 'editor.drum.headType.circledSlash' },
  { value: DrumHeadTypeEnum.Triangle, labelKey: 'editor.drum.headType.triangle' },
  { value: DrumHeadTypeEnum.Diamond, labelKey: 'editor.drum.headType.diamond' }
]

export const DRUM_DOT_OPTIONS: { value: 0 | 1 | 2; labelKey: string }[] = ([0, 1, 2] as const).map(
  (value) => ({ value, labelKey: `editor.note.augmentationDotCount.${value}` })
)

/** 音符 / 休止符时值：无全音符 / 二分音符（鼓谱上限为四分） */
export const DRUM_CHRONAXIE_VALUES: Chronaxie[] = CHRONAXIE_VALUES.filter((value) => value <= DRUM_MAX_CHRONAXIE)

export const DRUM_DOT_VALUES: (0 | 1 | 2)[] = [0, 1, 2]

export const DRUM_CHRONAXIE_OPTIONS: { value: Chronaxie; labelKey: string }[] = DRUM_CHRONAXIE_VALUES.map((value) => ({
  value,
  labelKey: `editor.note.durationValue.${value}`
}))

/** 超出的时值夹回四分 */
export function normalizeAddDrumState(state: AddDrumState): AddDrumState {
  if (state.chronaxie > DRUM_MAX_CHRONAXIE) {
    return { ...state, chronaxie: DRUM_MAX_CHRONAXIE }
  }
  return state
}
