import { ClefTypeEnum, KeySignatureTypeEnum } from 'deciphony-renderer'
import {
  resolveWhiteboardClefLabel as resolveWhiteboardClefLabelI18n,
  resolveWhiteboardKeyCountLabel as resolveWhiteboardKeyCountLabelI18n,
  resolveWhiteboardKeySignatureLabel as resolveWhiteboardKeySignatureLabelI18n,
  resolveWhiteboardPitchNotationLabel as resolveWhiteboardPitchNotationLabelI18n,
  resolveWhiteboardWidthTypeLabel as resolveWhiteboardWidthTypeLabelI18n
} from '@renderer/i18n/helpers'

export const WHITEBOARD_STORAGE_KEY = 'whiteboard.settings'

export type WhiteboardKeyCount = 88 | 76 | 61 | 54 | 49
export type WhiteboardWidthType = 'custom' | 'fillParent'
/** VirtualPiano pitchNotation 取值 */
export type WhiteboardPitchNotation = 'None' | 'Helmholtz' | 'Scientific'

/** 添加音符时可选的目标谱号（对应模板里三个单谱表） */
export type WhiteboardClef = ClefTypeEnum.Treble | ClefTypeEnum.Alto | ClefTypeEnum.Bass

export interface WhiteboardMidiRange {
  min: number
  max: number
}

export interface WhiteboardKeyCountOption {
  value: WhiteboardKeyCount
  label: string
  midi: WhiteboardMidiRange
}

/** 常见键盘规格的 midi 范围 */
export const WHITEBOARD_KEY_COUNT_OPTIONS: WhiteboardKeyCountOption[] = [
  { value: 88, label: '88键', midi: { min: 21, max: 108 } },
  { value: 76, label: '76键', midi: { min: 28, max: 103 } },
  { value: 61, label: '61键', midi: { min: 36, max: 96 } },
  { value: 54, label: '54键', midi: { min: 41, max: 96 } },
  { value: 49, label: '49键', midi: { min: 36, max: 84 } }
]

export const WHITEBOARD_WIDTH_TYPE_OPTIONS: { value: WhiteboardWidthType; label: string }[] = [
  { value: 'custom', label: '自定义' },
  { value: 'fillParent', label: '铺满全屏' }
]

export const WHITEBOARD_PITCH_NOTATION_OPTIONS: {
  value: WhiteboardPitchNotation
  label: string
}[] = [
  { value: 'None', label: '无' },
  { value: 'Helmholtz', label: '赫尔姆霍兹' },
  { value: 'Scientific', label: '科学记谱法' }
]

export const WHITEBOARD_KEY_HEIGHT_MIN = 80
export const WHITEBOARD_KEY_HEIGHT_MAX = 280
export const WHITEBOARD_KEY_HEIGHT_DEFAULT = 96

export const WHITEBOARD_WHITE_KEY_WIDTH_MIN = 20
export const WHITEBOARD_WHITE_KEY_WIDTH_MAX = 72
export const WHITEBOARD_WHITE_KEY_WIDTH_DEFAULT = 36

/** 钢琴区固定高度（最大键高 + 上下 padding），不随音程滑块等开关变化 */
export const WHITEBOARD_PIANO_SECTION_HEIGHT =
  WHITEBOARD_KEY_HEIGHT_MAX + 16

/** 教学白板按住琴键时 trigger 的持续秒数（keyup 前由 release 结束） */
export const WHITEBOARD_NOTE_HOLD_DURATION_SEC = 3600

export const WHITEBOARD_DEFAULT_KEY_COUNT: WhiteboardKeyCount = 88
export const WHITEBOARD_DEFAULT_WIDTH_TYPE: WhiteboardWidthType = 'fillParent'
export const WHITEBOARD_DEFAULT_PITCH_NOTATION: WhiteboardPitchNotation = 'None'

/** 谱号选择项：低/中/高音谱号 */
export const WHITEBOARD_CLEF_OPTIONS: { value: WhiteboardClef; label: string }[] = [
  { value: ClefTypeEnum.Treble, label: '高音谱号' },
  { value: ClefTypeEnum.Alto, label: '中音谱号' },
  { value: ClefTypeEnum.Bass, label: '低音谱号' }
]

export const WHITEBOARD_DEFAULT_CLEF: WhiteboardClef = ClefTypeEnum.Treble

/** 添加音符默认开启 */
export const WHITEBOARD_DEFAULT_ADD_NOTE = true

/** 按键时值推断使用的 BPM（不作用于 NPlayer） */
export const WHITEBOARD_NOTE_BPM_MIN = 30
export const WHITEBOARD_NOTE_BPM_MAX = 300
export const WHITEBOARD_NOTE_BPM_DEFAULT = 120

/** 调号选择项（同步作用于全部单谱表） */
export const WHITEBOARD_KEY_SIGNATURE_OPTIONS: {
  value: KeySignatureTypeEnum
  label: string
}[] = [
  { value: KeySignatureTypeEnum.C, label: 'C (无升降)' },
  { value: KeySignatureTypeEnum.G, label: 'G (1♯)' },
  { value: KeySignatureTypeEnum.D, label: 'D (2♯)' },
  { value: KeySignatureTypeEnum.A, label: 'A (3♯)' },
  { value: KeySignatureTypeEnum.E, label: 'E (4♯)' },
  { value: KeySignatureTypeEnum.B, label: 'B (5♯)' },
  { value: KeySignatureTypeEnum.F_sharp, label: 'F♯ (6♯)' },
  { value: KeySignatureTypeEnum.C_sharp, label: 'C♯ (7♯)' },
  { value: KeySignatureTypeEnum.F, label: 'F (1♭)' },
  { value: KeySignatureTypeEnum.B_flat, label: 'B♭ (2♭)' },
  { value: KeySignatureTypeEnum.E_flat, label: 'E♭ (3♭)' },
  { value: KeySignatureTypeEnum.A_flat, label: 'A♭ (4♭)' },
  { value: KeySignatureTypeEnum.D_flat, label: 'D♭ (5♭)' },
  { value: KeySignatureTypeEnum.G_flat, label: 'G♭ (6♭)' },
  { value: KeySignatureTypeEnum.C_flat, label: 'C♭ (7♭)' }
]

export const WHITEBOARD_DEFAULT_KEY_SIGNATURE: KeySignatureTypeEnum = KeySignatureTypeEnum.C

export function resolveWhiteboardMidiRange(keyCount: WhiteboardKeyCount): WhiteboardMidiRange {
  const option = WHITEBOARD_KEY_COUNT_OPTIONS.find((item) => item.value === keyCount)
  return option?.midi ?? WHITEBOARD_KEY_COUNT_OPTIONS[0].midi
}

export function resolveWhiteboardKeyCountLabel(keyCount: WhiteboardKeyCount): string {
  return resolveWhiteboardKeyCountLabelI18n(keyCount)
}

export function resolveWhiteboardWidthTypeLabel(widthType: WhiteboardWidthType): string {
  return resolveWhiteboardWidthTypeLabelI18n(widthType)
}

export function resolveWhiteboardPitchNotationLabel(notation: WhiteboardPitchNotation): string {
  return resolveWhiteboardPitchNotationLabelI18n(notation)
}

export function resolveWhiteboardClefLabel(clef: WhiteboardClef): string {
  return resolveWhiteboardClefLabelI18n(clef)
}

export function resolveWhiteboardKeySignatureLabel(key: KeySignatureTypeEnum): string {
  return resolveWhiteboardKeySignatureLabelI18n(key)
}
