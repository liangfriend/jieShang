import type {Chronaxie} from '@deciphony/renderer'
import {BendTypeEnum, SlurTypeEnum} from '@deciphony/renderer'

/** 小节添加模式：待插入的吉他 / 尤克里里符号 */
export type TabAddKind = 'normal' | 'harmonic' | 'arpeggio' | 'strumming' | 'rest'

export type AddTabState = {
  kind: TabAddKind
  chronaxie: Chronaxie
  /** 品；-1 为 x */
  fret: number
  /** 琶音 / 扫弦起点，0 起（界面显示 +1） */
  regionStart: number
  /** 琶音 / 扫弦终点，0 起 */
  regionEnd: number
}

export const DEFAULT_ADD_TAB_STATE: AddTabState = {
  kind: 'normal',
  chronaxie: 64,
  fret: 0,
  regionStart: 0,
  regionEnd: 5,
}

/** `labelKey` 为 i18n key，由组件 `t()` 翻译 */
export const TAB_ADD_KIND_OPTIONS: {value: TabAddKind; labelKey: string}[] = (
  ['normal', 'harmonic', 'arpeggio', 'strumming', 'rest'] as const
).map((value) => ({value, labelKey: `editor.addTab.kind.${value}`}))

export const BEND_TYPE_OPTIONS: {value: BendTypeEnum; labelKey: string}[] = [
  {value: BendTypeEnum.Bend, labelKey: 'editor.tabNote.bendTypes.bend'},
  {value: BendTypeEnum.BendRelease, labelKey: 'editor.tabNote.bendTypes.bendRelease'},
  {value: BendTypeEnum.Prebend, labelKey: 'editor.tabNote.bendTypes.prebend'},
  {value: BendTypeEnum.PrebendRelease, labelKey: 'editor.tabNote.bendTypes.prebendRelease'},
  {value: BendTypeEnum.PrebendBend, labelKey: 'editor.tabNote.bendTypes.prebendBend'},
]

/** 空串表示无滑音类型 */
export const TAB_SLUR_TYPE_OPTIONS: {value: SlurTypeEnum | ''; labelKey: string}[] = [
  {value: '', labelKey: 'editor.tabNote.chordNone'},
  {value: SlurTypeEnum.H, labelKey: 'editor.tabNote.slurTypes.H'},
  {value: SlurTypeEnum.S, labelKey: 'editor.tabNote.slurTypes.S'},
  {value: SlurTypeEnum.P, labelKey: 'editor.tabNote.slurTypes.P'},
  {value: SlurTypeEnum.HP, labelKey: 'editor.tabNote.slurTypes.HP'},
]

export const TAB_FRET_OPTIONS: {value: number; label: string}[] = [
  {value: -1, label: 'x'},
  ...Array.from({length: 28}, (_, fret) => ({value: fret, label: String(fret)})),
]

export const TAB_SEMITONE_OPTIONS: {value: number; label: string}[] = [
  0, 0.5, 1, 1.5, 2, 2.5, 3,
].map((value) => ({value, label: String(value)}))
