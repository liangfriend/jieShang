import type {
  Measure,
  MusicScore,
  SingleStaff,
  SlotData,
} from '@deciphony/renderer'
import {
  BarlineTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  MeasureEndRepeatEnum,
  MeasureStartRepeatEnum,
  TIME_SIGNATURE_TYPES_ORDERED,
  TimeSignatureTypeEnum,
} from '@deciphony/renderer'
import {
  createBarline,
  createClef,
  createKeySignature,
  createMeasureEndRepeat,
  createMeasureStartRepeat,
  createTimeSignature,
} from '@deciphony/extensions/dr-edit/score-builder'
import {insertMeasureColumn} from './renderEditMeasureColumn'

export type MeasureEditSlot = SlotData & {measure: Measure; singleStaff: SingleStaff}

const ALL_BARLINE_VALUES: BarlineTypeEnum[] = [
  BarlineTypeEnum.Single_barline,
  BarlineTypeEnum.Double_barline,
  BarlineTypeEnum.StartRepeat_barline,
  BarlineTypeEnum.EndRepeat_barline,
  BarlineTypeEnum.Dashed_barline,
  BarlineTypeEnum.Final_barline,
  BarlineTypeEnum.Start_end_repeat_barline,
  BarlineTypeEnum.Dotted_barline,
  BarlineTypeEnum.Reverse_barline,
  BarlineTypeEnum.Heavy_barline,
  BarlineTypeEnum.Heavy_double_barline,
]

/** 编辑界面不展示的类型 */
const BARLINE_HIDDEN = new Set<BarlineTypeEnum>([BarlineTypeEnum.Start_end_repeat_barline])

/** 仅前置小节线可选 */
const BARLINE_FRONT_ONLY = new Set<BarlineTypeEnum>([
  BarlineTypeEnum.Reverse_barline,
  BarlineTypeEnum.StartRepeat_barline,
])

/** 仅后置小节线可选 */
const BARLINE_BACK_ONLY = new Set<BarlineTypeEnum>([
  BarlineTypeEnum.Final_barline,
  BarlineTypeEnum.EndRepeat_barline,
])

export const BARLINE_F_VALUES: BarlineTypeEnum[] = [
  BarlineTypeEnum.StartRepeat_barline,
  BarlineTypeEnum.Reverse_barline,
]

export const BARLINE_B_VALUES = ALL_BARLINE_VALUES.filter(
  (value) => !BARLINE_HIDDEN.has(value) && !BARLINE_FRONT_ONLY.has(value),
)

export const CLEF_VALUES: ClefTypeEnum[] = [
  ClefTypeEnum.Treble,
  ClefTypeEnum.Bass,
  ClefTypeEnum.Alto,
  ClefTypeEnum.Tenor,
]

/** 吉他 / 尤克里里小节前置谱号：仅 TAB */
export const TAB_CLEF_VALUES: ClefTypeEnum[] = [ClefTypeEnum.Tab]

export const KEY_SIGNATURE_VALUES: KeySignatureTypeEnum[] = [
  KeySignatureTypeEnum.C,
  KeySignatureTypeEnum.G,
  KeySignatureTypeEnum.D,
  KeySignatureTypeEnum.A,
  KeySignatureTypeEnum.E,
  KeySignatureTypeEnum.B,
  KeySignatureTypeEnum.F_sharp,
  KeySignatureTypeEnum.C_sharp,
  KeySignatureTypeEnum.F,
  KeySignatureTypeEnum.B_flat,
  KeySignatureTypeEnum.E_flat,
  KeySignatureTypeEnum.A_flat,
  KeySignatureTypeEnum.D_flat,
  KeySignatureTypeEnum.G_flat,
  KeySignatureTypeEnum.C_flat,
]

export const TIME_SIGNATURE_VALUES: TimeSignatureTypeEnum[] = [...TIME_SIGNATURE_TYPES_ORDERED]

export const START_REPEAT_VALUES: MeasureStartRepeatEnum[] = [
  MeasureStartRepeatEnum.Segno,
  MeasureStartRepeatEnum.Coda,
]

export const END_REPEAT_VALUES: MeasureEndRepeatEnum[] = [
  MeasureEndRepeatEnum.Fine,
  MeasureEndRepeatEnum.DC,
  MeasureEndRepeatEnum.DS,
  MeasureEndRepeatEnum.To_coda,
  MeasureEndRepeatEnum.DC_al_fine,
  MeasureEndRepeatEnum.DC_al_coda,
  MeasureEndRepeatEnum.DS_al_fine,
  MeasureEndRepeatEnum.DS_al_coda,
]

export function insertMeasureBefore(slot: MeasureEditSlot): Measure {
  return insertMeasureColumn(slot.musicScore, slot.singleStaff, slot.measure, 'before')
}

export function insertMeasureAfter(slot: MeasureEditSlot): Measure {
  return insertMeasureColumn(slot.musicScore, slot.singleStaff, slot.measure, 'after')
}

/** 小节线作用的小节：连谱模式下谱表间的连谱小节线按各谱表同列小节绘制，需整列一起改 */
export function barlineTargetMeasures(slot: MeasureEditSlot): Measure[] {
  const grandStaff = slot.grandStaff
  if (!grandStaff?.linkedStaff) return [slot.measure]
  const index = slot.singleStaff.measures.findIndex((m) => m.id === slot.measure.id)
  if (index < 0) return [slot.measure]
  return grandStaff.staves
    .map((staff) => staff.measures[index])
    .filter((m): m is Measure => Boolean(m))
}

export function setMeasureBarlineB(measure: Measure, type: BarlineTypeEnum | null): void {
  if (type == null) {
    delete measure.barline_b
    return
  }
  if (measure.barline_b) {
    measure.barline_b.type = type
  } else {
    measure.barline_b = createBarline(type)
  }
}

export function setMeasureBarlineF(measure: Measure, type: BarlineTypeEnum | null): void {
  if (type == null) {
    delete measure.barline_f
    return
  }
  if (measure.barline_f) {
    measure.barline_f.type = type
  } else {
    measure.barline_f = createBarline(type)
  }
}

export function setSlotBarlineB(slot: MeasureEditSlot, type: BarlineTypeEnum | null): void {
  for (const m of barlineTargetMeasures(slot)) setMeasureBarlineB(m, type)
}

export function setSlotBarlineF(slot: MeasureEditSlot, type: BarlineTypeEnum | null): void {
  for (const m of barlineTargetMeasures(slot)) setMeasureBarlineF(m, type)
}

/**
 * 快捷键 { / }：前置在 无 → 前置类型… 间循环；后置在 BARLINE_B_VALUES 间循环，没有后置小节线时按单小节线算
 */
export function cycleSlotBarline(slot: MeasureEditSlot, side: 'f' | 'b'): void {
  if (side === 'f') {
    const cycle: (BarlineTypeEnum | null)[] = [null, ...BARLINE_F_VALUES]
    const current = cycle.indexOf(slot.measure.barline_f?.type ?? null)
    setSlotBarlineF(slot, cycle[(current + 1) % cycle.length] ?? null)
    return
  }
  const current = BARLINE_B_VALUES.indexOf(slot.measure.barline_b?.type ?? BarlineTypeEnum.Single_barline)
  setSlotBarlineB(slot, BARLINE_B_VALUES[(current + 1) % BARLINE_B_VALUES.length]!)
}
export function setMeasureClefF(measure: Measure, type: ClefTypeEnum | null): void {
  if (type == null) {
    delete measure.clef_f
    return
  }
  if (measure.clef_f) {
    measure.clef_f.type = type
  } else {
    measure.clef_f = createClef(type)
  }
}

export function setMeasureKeySignatureF(measure: Measure, type: KeySignatureTypeEnum | null): void {
  if (type == null) {
    delete measure.keySignature_f
    return
  }
  if (measure.keySignature_f) {
    measure.keySignature_f.type = type
  } else {
    measure.keySignature_f = createKeySignature(type)
  }
}

export function setMeasureTimeSignatureF(measure: Measure, type: TimeSignatureTypeEnum | null): void {
  if (type == null) {
    delete measure.timeSignature_f
    return
  }
  if (measure.timeSignature_f) {
    measure.timeSignature_f.type = type
  } else {
    measure.timeSignature_f = createTimeSignature(type)
  }
}

export function setMeasureClefB(measure: Measure, type: ClefTypeEnum | null): void {
  if (type == null) {
    delete measure.clef_b
    return
  }
  if (measure.clef_b) {
    measure.clef_b.type = type
  } else {
    measure.clef_b = createClef(type)
  }
}

export function setMeasureKeySignatureB(measure: Measure, type: KeySignatureTypeEnum | null): void {
  if (type == null) {
    delete measure.keySignature_b
    return
  }
  if (measure.keySignature_b) {
    measure.keySignature_b.type = type
  } else {
    measure.keySignature_b = createKeySignature(type)
  }
}

export function setMeasureTimeSignatureB(measure: Measure, type: TimeSignatureTypeEnum | null): void {
  if (type == null) {
    delete measure.timeSignature_b
    return
  }
  if (measure.timeSignature_b) {
    measure.timeSignature_b.type = type
  } else {
    measure.timeSignature_b = createTimeSignature(type)
  }
}

export function setMeasureStartRepeat(measure: Measure, type: MeasureStartRepeatEnum | null): void {
  if (type == null) {
    delete measure.startRepeat
    return
  }
  if (measure.startRepeat) {
    measure.startRepeat.type = type
  } else {
    measure.startRepeat = createMeasureStartRepeat(type)
  }
}

export function setMeasureEndRepeat(measure: Measure, type: MeasureEndRepeatEnum | null): void {
  if (type == null) {
    delete measure.endRepeat
    return
  }
  if (measure.endRepeat) {
    measure.endRepeat.type = type
  } else {
    measure.endRepeat = createMeasureEndRepeat(type)
  }
}

/** @deprecated 使用 findVoltaAtMeasure；保留别名兼容旧引用 */
export {findVoltaAtMeasure, findVoltaAtMeasure as findVoltaEndingAt} from './renderEditVoltaAdd'

export function removeVolta(musicScore: MusicScore, voltaId: string): void {
  const idx = musicScore.affiliatedSymbols.findIndex((sym) => sym.id === voltaId)
  if (idx >= 0) musicScore.affiliatedSymbols.splice(idx, 1)
}

/** 内部存储（0 起）→ 用户展示（1 起） */
export function voltaValueToDisplay(values: number[]): number[] {
  return values.map((v) => v + 1)
}

/** 用户输入（1 起）→ 内部存储（0 起） */
export function voltaValueFromDisplay(values: number[]): number[] {
  const nums = values
    .map((v) => Math.trunc(v) - 1)
    .filter((n) => Number.isFinite(n) && n >= 0)
  const unique = [...new Set(nums)].sort((a, b) => a - b)
  return unique.length > 0 ? unique : [0]
}

export function parseVoltaValueText(text: string): number[] {
  const parts = text.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean)
  const displayNums = parts
    .map((p) => Number.parseInt(p, 10))
    .filter((n) => Number.isFinite(n) && n >= 1)
  return voltaValueFromDisplay(displayNums)
}

export function formatVoltaValue(value: number[]): string {
  return voltaValueToDisplay(value).join(', ')
}
