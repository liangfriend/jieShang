import type {Chronaxie, Measure, MusicScore, NoteNumber, NotesNumberInfo, SlotData, VDom} from '@deciphony/renderer'
import {getMeasureNoteList, slotSymbol} from '@deciphony/renderer'
import {createNoteNumber, computeMeasureOnsetBefore} from '@deciphony/extensions/dr-edit/score-builder'
import {isNoteNumberSlot, isSlotRestLike} from '@deciphony/extensions/dr-edit/score-builder'
import {
  DEFAULT_ADD_NUMBER_STATE,
  syllableForAddState,
  type AddNumberState,
} from './renderEditNumberAddState'
import {previewNumberRestSvgHtml, previewNumberSvgHtml} from './numberSvg'

export {
  MEASURE_HEIGHT,
  MEASURE_ADD_HOVER_RANGE,
  computeSnapPoints,
  findMeasureElement,
  findMeasureSlotElement,
  findMeasureSlotVDom,
  findMeasureVDom,
  isMeasureAddMode,
  isPointerInMeasureAddRange,
  isPointerInMeasureBounds,
  measureBoundsFromVDom,
  nearestSnapPoint,
  pointerToSvg,
  resolveMeasureBounds,
  resolveMeasureSlotAtPointer,
  type MeasureBounds,
  type SnapPoint,
} from '../standardStaff/renderEditSymbolAddAction'

import {
  computeSnapPoints,
  findMeasureSlotVDom,
  isMeasureAddMode,
  isPointerInMeasureAddRange,
  nearestSnapPoint,
} from '../standardStaff/renderEditSymbolAddAction'

/** 简谱音符预览高度（与皮肤 Number_1 接近） */
export const NUMBER_HEAD_HEIGHT = 18
export const NUMBER_PREVIEW_WIDTH = 14

export type GhostNumberPreview = {
  visible: true
  measureId: string
  slotKind: AddNumberState['kind']
  x: number
  y: number
  syllable: NotesNumberInfo['syllable']
  chronaxie: Chronaxie
  octaveDot: NotesNumberInfo['octaveDot']
  svgHtml: string
  snap: import('../standardStaff/renderEditSymbolAddAction').SnapPoint
}

export type MeasureAddActionResult = {type: 'inserted'}

function collectNumberSlotAnchors(vDomList: VDom[], measure: Measure, measureX: number) {
  const anchors: import('../standardStaff/renderEditSymbolAddAction').SlotAnchor[] = []
  const notes = getMeasureNoteList(measure)
  for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
    const slot = notes[noteIndex]!
    if (!isNoteNumberSlot(slot)) continue
    // MeasureNoteSlot = { id, symbol }；notesInfo 在 symbol 上
    const body = slotSymbol(slot) as NoteNumber
    // 简谱休止符 vdom targetId = 休止 notesInfo.id，无 notesInfo 时为 NoteNumber.id
    const id = isSlotRestLike(slot) ? (body.notesInfo?.[0]?.id ?? body.id) : body.notesInfo?.[0]?.id
    if (!id) continue
    // 简谱音符头 tag 为 noteNumber（非五线谱 noteHead）
    const tag = isSlotRestLike(slot) ? 'rest' : 'noteNumber'
    const vdom = vDomList.find((node) => node.targetId === id && node.tag === tag)
    if (vdom) {
      anchors.push({
        centerX: vdom.x + vdom.w / 2 - measureX,
        noteIndex,
        // 简谱不在已有音符上叠声部，仅作 insert 锚点
        isNoteSymbol: false,
      })
    }
  }
  return anchors
}

export function findNoteNumberElement(root: ParentNode, notesNumberInfoId: string): SVGElement | null {
  const el =
    root.querySelector(`[data-target-id="${notesNumberInfoId}"][data-tag="noteNumber"]`)
    ?? root.querySelector(`[data-target-id="${notesNumberInfoId}"][data-tag="noteHead"]`)
  return el instanceof SVGElement ? el : null
}

/** 指针 y → 唱名 1–7（上高下低） */
export function syllableFromSvgY(svgY: number, bounds: {y: number; h: number}): Exclude<NotesNumberInfo['syllable'], 0 | 'X'> {
  const relativeY = svgY - bounds.y
  const t = Math.max(0, Math.min(1, relativeY / bounds.h))
  const raw = Math.round(7 - t * 6)
  return Math.max(1, Math.min(7, raw)) as Exclude<NotesNumberInfo['syllable'], 0 | 'X'>
}

export function numberPreviewY(bounds: {y: number; h: number}, measureNodeY: number): number {
  return measureNodeY + (bounds.h - NUMBER_HEAD_HEIGHT) / 2
}

export type ResolveGhostNumberParams = {
  selected: SlotData | null
  vDomList: VDom[]
  svgX: number
  svgY: number
  measureBounds: {x: number; y: number; w: number; h: number}
  addNoteState?: AddNumberState
}

export function resolveGhostNumberPreview(params: ResolveGhostNumberParams): GhostNumberPreview | null {
  const {selected, vDomList, svgX, svgY, measureBounds, addNoteState = DEFAULT_ADD_NUMBER_STATE} = params
  if (!isMeasureAddMode(selected)) return null

  const measure = selected.measure
  const measureNode = findMeasureSlotVDom(vDomList, measure.id)
  if (!measureNode || !isPointerInMeasureAddRange(svgX, svgY, measureBounds)) {
    return null
  }

  const relativeX = svgX - measureNode.x
  const anchors = collectNumberSlotAnchors(vDomList, measure, measureNode.x)
  const snapPoints = computeSnapPoints(measureNode.w, anchors)
  // 简谱仅允许在 slot 间隙插入（A/B/C/D），不可像五线谱在音符上叠 region
  const insertPoints = snapPoints.filter((point) => point.kind === 'insert')
  const snap = nearestSnapPoint(
    relativeX,
    insertPoints.length > 0 ? insertPoints : snapPoints,
  )

  const chronaxie = addNoteState.chronaxie
  const syllable = addNoteState.kind === 'note'
    ? syllableFromSvgY(svgY, measureBounds)
    : syllableForAddState(addNoteState)
  const octaveDot = syllable === 0 ? 0 : (addNoteState.octaveDot ?? 0)
  const y = numberPreviewY(measureBounds, measureNode.y)
  const svgHtml = syllable === 0
    ? previewNumberRestSvgHtml(chronaxie)
    : previewNumberSvgHtml(syllable)

  return {
    visible: true,
    measureId: measure.id,
    slotKind: addNoteState.kind,
    x: snap.x - NUMBER_PREVIEW_WIDTH / 2,
    y: y - measureNode.y,
    syllable,
    chronaxie,
    octaveDot,
    svgHtml,
    snap,
  }
}

export function applyMeasureAddAction(
  slot: SlotData & {measure: Measure},
  preview: GhostNumberPreview,
  _musicScore: MusicScore,
): MeasureAddActionResult | null {
  const measure = slot.measure
  if (preview.snap.kind !== 'insert') return null

  const notes = getMeasureNoteList(measure)
  const at = Math.max(0, Math.min(preview.snap.insertIndex, notes.length))
  const beamOnset = computeMeasureOnsetBefore(measure, at)
  const note = createNoteNumber({
    syllable: preview.syllable,
    chronaxie: preview.chronaxie,
    octaveDot: preview.octaveDot,
    beamOnset
  })
  notes.splice(at, 0, note)
  return {type: 'inserted'}
}
