/**
 * 插槽按钮 → dr-edit 的桥接：新增谱表时继承上一谱表结构等产品策略放 editHelper。
 */
import type { GrandStaff, Measure, SingleStaff, SlotData } from '@deciphony/renderer'
import { BarlineTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import {
  deleteGrandStaff,
  deleteSingleStaff,
  insertGrandStaff,
  insertSingleStaff
} from '@deciphony/extensions/dr-edit'
import { addMeasureColumn } from './renderEditMeasureColumn'
import {
  createBarline,
  createBracket,
  createClef,
  createKeySignature,
  createMeasure,
  createMeasureEndRepeat,
  createMeasureStartRepeat,
  createSingleStaff,
  createTimeSignature
} from '@deciphony/extensions/dr-edit/score-builder'
import {
  applySpacingToGrandStaff,
  applySpacingToSingleStaff
} from '@renderer/utils/scoreSpacingDefaults'
import { applyInstrumentScoreToneToStaff } from '@renderer/utils/instrumentScoreTone'

type WidthPartial = {
  widthRatio?: number
  widthRatioForMeasure?: number
}

function cloneWidthPartial(source: WidthPartial): WidthPartial {
  return {
    widthRatio: source.widthRatio,
    widthRatioForMeasure: source.widthRatioForMeasure
  }
}

/** 克隆空小节结构（谱号/调号/拍号/小节线/反复/宽度），不含音符 */
function cloneEmptyMeasure(
  source: Measure,
  notationType: MusicScoreTypeEnum
): Measure {
  const isNumberNotation = notationType === MusicScoreTypeEnum.NumberNotation
  const measure = createMeasure({
    widthRatioForMeasure: source.widthRatioForMeasure,
    barline: source.barline_b?.type ?? BarlineTypeEnum.Single_barline
  })

  if (source.barline_b) {
    measure.barline_b = createBarline(
      source.barline_b.type,
      cloneWidthPartial(source.barline_b)
    )
  }
  if (source.barline_f) {
    measure.barline_f = createBarline(
      source.barline_f.type,
      cloneWidthPartial(source.barline_f)
    )
  }

  if (!isNumberNotation) {
    if (source.clef_f) {
      measure.clef_f = createClef(source.clef_f.type, cloneWidthPartial(source.clef_f))
    }
    if (source.clef_b) {
      measure.clef_b = createClef(source.clef_b.type, cloneWidthPartial(source.clef_b))
    }
    if (source.keySignature_f) {
      measure.keySignature_f = createKeySignature(
        source.keySignature_f.type,
        cloneWidthPartial(source.keySignature_f)
      )
    }
    if (source.keySignature_b) {
      measure.keySignature_b = createKeySignature(
        source.keySignature_b.type,
        cloneWidthPartial(source.keySignature_b)
      )
    }
    if (source.timeSignature_f) {
      measure.timeSignature_f = createTimeSignature(
        source.timeSignature_f.type,
        cloneWidthPartial(source.timeSignature_f)
      )
    }
    if (source.timeSignature_b) {
      measure.timeSignature_b = createTimeSignature(
        source.timeSignature_b.type,
        cloneWidthPartial(source.timeSignature_b)
      )
    }
  }

  if (source.startRepeat) {
    measure.startRepeat = createMeasureStartRepeat(source.startRepeat.type)
  }
  if (source.endRepeat) {
    measure.endRepeat = createMeasureEndRepeat(source.endRepeat.type)
  }
  if (source.floorSpan?.length) {
    measure.floorSpan = [...source.floorSpan]
  }

  return measure
}

function cloneEmptyMeasuresFrom(
  source: SingleStaff,
  notationType: MusicScoreTypeEnum
): Measure[] {
  return source.measures.map((measure) => cloneEmptyMeasure(measure, notationType))
}

function createEmptyStaffFromSource(
  source: SingleStaff,
  notationType: MusicScoreTypeEnum
): SingleStaff {
  const staff = createSingleStaff({
    withDefaultMeasure: false,
    notationType
  })
  staff.measures = cloneEmptyMeasuresFrom(source, notationType)
  return staff
}

/** g-d 插槽：在当前复谱表下方插入复谱表，继承其单谱表数量与各谱表小节结构 */
export function addGrandStaffFromSlot(slot: SlotData): GrandStaff {
  if (!slot.grandStaff) throw new Error('当前插槽无复谱表上下文')
  const anchor = slot.grandStaff
  const notationType = slot.musicScore.type
  /** 插入前读取当前曲谱连谱开关（与工具栏 LinkedStaffModeSwitch 一致） */
  const linkedStaffMode =
    slot.musicScore.grandStaffs.length > 0 &&
    slot.musicScore.grandStaffs.every((grandStaff) => grandStaff.linkedStaff === true)

  const grandStaff = insertGrandStaff(slot.musicScore, anchor, 'after')
  applySpacingToGrandStaff(grandStaff)

  if (linkedStaffMode) grandStaff.linkedStaff = true
  else delete grandStaff.linkedStaff

  if (anchor.bracket) {
    grandStaff.bracket = createBracket(
      anchor.bracket.type,
      anchor.bracket.startSingleStaffIndex
    )
  }

  const sources =
    anchor.staves.length > 0
      ? anchor.staves
      : [createSingleStaff({ withDefaultMeasure: true, notationType })]

  grandStaff.staves = sources.map((source) => {
    const staff = createEmptyStaffFromSource(source, notationType)
    applySpacingToSingleStaff(staff)
    applyInstrumentScoreToneToStaff(staff, notationType)
    return staff
  })

  return grandStaff
}

/** g-d 插槽：删除当前复谱表（至少保留 1 个复谱表） */
export function deleteGrandStaffFromSlot(slot: SlotData): boolean {
  if (!slot.grandStaff) return false
  if (slot.musicScore.grandStaffs.length <= 1) return false
  deleteGrandStaff(slot.musicScore, slot.grandStaff)
  return true
}

/** s-d 插槽：在 anchor 单谱表下方追加单谱表，继承其小节结构 */
export function addSingleStaffFromSlot(slot: SlotData) {
  if (!slot.grandStaff) throw new Error('当前插槽无复谱表上下文')
  if (!slot.singleStaff) throw new Error('当前插槽无单谱表上下文')
  const anchor = slot.singleStaff
  const notationType = slot.musicScore.type
  const newStaff = insertSingleStaff(slot.grandStaff, anchor, 'after', { notationType })
  applySpacingToSingleStaff(newStaff)
  newStaff.measures = cloneEmptyMeasuresFrom(anchor, notationType)
  applyInstrumentScoreToneToStaff(newStaff, notationType)
  return newStaff
}

/** s-d 插槽：删除当前单谱表（同一复谱表内至少保留 1 个单谱表） */
export function deleteSingleStaffFromSlot(slot: SlotData): boolean {
  if (!slot.grandStaff || !slot.singleStaff) return false
  if (slot.grandStaff.staves.length <= 1) return false
  deleteSingleStaff(slot.grandStaff, slot.singleStaff)
  return true
}

/** s-d 插槽：在复谱表每个单谱表末尾追加一个小节 */
export function addMeasureFromSlot(slot: SlotData) {
  if (!slot.singleStaff) throw new Error('当前插槽无单谱表上下文')
  return addMeasureColumn(slot.musicScore, slot.singleStaff)
}
