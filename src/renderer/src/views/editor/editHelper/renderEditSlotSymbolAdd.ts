import type {Measure, MeasureNoteSlot, MusicScore, SingleStaff, SlotData} from '@deciphony/renderer'
import {
  DoubleSlotAffiliatedSymbolNameEnum,
  GuzhengLianTypeEnum,
  HairpinTypeEnum,
  SingleSlotAffiliatedSymbolNameEnum,
  TrillTypeEnum,
  type DoubleSlotAffiliatedSymbol,
  type SingleSlotAffiliatedSymbol,
} from '@deciphony/renderer'
import {
  createArpeggio,
  createGuzhengLian,
  createHairpin,
  createPedal,
  createPitch,
  createPreludeBracketLeft,
  createPreludeBracketRight,
  createStrumming,
  createTrill,
  DEFAULT_MEASURE_HEIGHT,
} from '@deciphony/extensions/dr-edit/score-builder'

import {ElMessage} from 'element-plus'
import {locateMeasureNote, measureVoiceSlots, type MeasureVoiceKey} from './asStaffOrNumber'
import {
  addSlotAffiliatedSymbol,
  listSlotAffiliatedOnSlot,
  removeSlotAffiliatedSymbol,
} from './renderEditSlotAffiliated'

/** 跨音符记号（连音线 / 踏板 / 颤音线等）因后续音符不足添加失败时提示 */
export function warnNotEnoughSpanNotes(t: (key: string) => string): void {
  ElMessage.warning(t('editor.spanSymbol.notEnoughNotes'))
}

/**
 * 踏板 / pitch 跨度（含当前列）。
 * 与连音线不同：允许 1（起止同一 slot）。
 */
export type SlotSymbolSpan = 1 | 2 | 3 | 4

export const SLOT_SYMBOL_SPAN_OPTIONS: SlotSymbolSpan[] = [1, 2, 3, 4]

export type PitchDirection = 'up' | 'down'

const ARPEGGIO_NAMES = new Set<string>([
  SingleSlotAffiliatedSymbolNameEnum.Arpeggio,
  SingleSlotAffiliatedSymbolNameEnum.arpeggio_straight,
])

const PITCH_NAMES = new Set<string>([
  DoubleSlotAffiliatedSymbolNameEnum.Pitch_up,
  DoubleSlotAffiliatedSymbolNameEnum.Pitch_down,
])

type SlotAnchor = {
  musicScore: MusicScore
  singleStaff: SingleStaff
  measure: Measure
  measureIndex: number
  /** 鼓谱声部；跨度只在同一声部内数列 */
  voice: MeasureVoiceKey
  noteIndex: number
  slot: MeasureNoteSlot
  /** 必须是 MeasureNoteSlot.id（附属符号锚定槽 id，不是 symbol.id） */
  slotId: string
  measureHeight: number
}

/** 选中态里的 note 往往是 symbol 本体；附属符号要锚定外层 MeasureNoteSlot.id */
function resolveSlotAnchor(editSlot: SlotData): SlotAnchor | null {
  const {musicScore, singleStaff, measure, note} = editSlot
  if (!singleStaff || !measure || !note) return null

  const measureIndex = singleStaff.measures.indexOf(measure)
  if (measureIndex < 0) return null

  const {voice, index: noteIndex} = locateMeasureNote(measure, note)
  if (noteIndex < 0) return null

  const measureSlot = measureVoiceSlots(measure, voice)[noteIndex]!
  const h = typeof (measure as Measure & {h?: number}).h === 'number'
    ? (measure as Measure & {h?: number}).h!
    : DEFAULT_MEASURE_HEIGHT

  return {
    musicScore,
    singleStaff,
    measure,
    measureIndex,
    voice,
    noteIndex,
    slot: measureSlot,
    slotId: measureSlot.id,
    measureHeight: h > 0 ? h : DEFAULT_MEASURE_HEIGHT,
  }
}

/** 从当前音符列起向右数 `slotsToRight` 个列（含休止符）；仅搜当前与下一小节 */
export function findSlotIdAtRightOffset(
  singleStaff: SingleStaff,
  startMeasureIndex: number,
  startNoteIndex: number,
  slotsToRight: number,
  voice: MeasureVoiceKey = null,
): string | null {
  if (slotsToRight <= 0) return null

  let remaining = slotsToRight
  let measureIndex = startMeasureIndex
  let noteIndex = startNoteIndex + 1

  while (remaining > 0) {
    if (measureIndex > startMeasureIndex + 1) return null
    if (measureIndex >= singleStaff.measures.length) return null

    const slots = measureVoiceSlots(singleStaff.measures[measureIndex]!, voice)
    if (noteIndex >= slots.length) {
      measureIndex += 1
      noteIndex = 0
      continue
    }

    const slot = slots[noteIndex]!
    noteIndex += 1
    remaining -= 1
    if (remaining === 0) return slot.id
  }

  return null
}

const STRUMMING_NAMES = new Set<string>([SingleSlotAffiliatedSymbolNameEnum.Strumming])

const PRELUDE_BRACKET_LEFT_NAMES = new Set<string>([
  SingleSlotAffiliatedSymbolNameEnum.Prelude_bracket_left,
])

const PRELUDE_BRACKET_RIGHT_NAMES = new Set<string>([
  SingleSlotAffiliatedSymbolNameEnum.Prelude_bracket_right,
])

export function listArpeggiosOnSlot(
  musicScore: MusicScore,
  slotId: string,
): SingleSlotAffiliatedSymbol[] {
  return listSlotAffiliatedOnSlot(musicScore, slotId, ARPEGGIO_NAMES)
}

export function listStrummingsOnSlot(
  musicScore: MusicScore,
  slotId: string,
): SingleSlotAffiliatedSymbol[] {
  return listSlotAffiliatedOnSlot(musicScore, slotId, STRUMMING_NAMES)
}

export function listPreludeBracketLeftOnSlot(
  musicScore: MusicScore,
  slotId: string,
): SingleSlotAffiliatedSymbol[] {
  return listSlotAffiliatedOnSlot(musicScore, slotId, PRELUDE_BRACKET_LEFT_NAMES)
}

export function listPreludeBracketRightOnSlot(
  musicScore: MusicScore,
  slotId: string,
): SingleSlotAffiliatedSymbol[] {
  return listSlotAffiliatedOnSlot(musicScore, slotId, PRELUDE_BRACKET_RIGHT_NAMES)
}

export function listPedalsStartingAt(
  musicScore: MusicScore,
  startId: string,
): DoubleSlotAffiliatedSymbol[] {
  return musicScore.affiliatedSymbols.filter(
    (sym): sym is DoubleSlotAffiliatedSymbol =>
      sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pedal
      && 'startId' in sym
      && sym.startId === startId
      && sym.data?.pedal != null,
  )
}

export function listPitchesStartingAt(
  musicScore: MusicScore,
  startId: string,
): DoubleSlotAffiliatedSymbol[] {
  return musicScore.affiliatedSymbols.filter(
    (sym): sym is DoubleSlotAffiliatedSymbol =>
      PITCH_NAMES.has(String(sym.name))
      && 'startId' in sym
      && sym.startId === startId
      && (sym.data as DoubleSlotAffiliatedSymbol['data'] | undefined)?.pitch != null,
  )
}

export function removeScoreAffiliatedSymbol(musicScore: MusicScore, symbolId: string): boolean {
  const idx = musicScore.affiliatedSymbols.findIndex((sym) => sym.id === symbolId)
  if (idx < 0) return removeSlotAffiliatedSymbol(musicScore, symbolId)
  musicScore.affiliatedSymbols.splice(idx, 1)
  return true
}

function ensureAffiliatedSymbols(musicScore: MusicScore): void {
  if (!Array.isArray(musicScore.affiliatedSymbols)) {
    musicScore.affiliatedSymbols = []
  }
}

/** 在当前音符列添加琶音（单 slot 附属） */
export function tryAddArpeggioFromNote(editSlot: SlotData): boolean {
  const anchor = resolveSlotAnchor(editSlot)
  if (!anchor) return false
  if (listArpeggiosOnSlot(anchor.musicScore, anchor.slotId).length > 0) return false

  addSlotAffiliatedSymbol(
    anchor.slot,
    createArpeggio({measureHeight: anchor.measureHeight, arrow: true}),
  )
  return true
}

/** 在当前音符列添加扫弦（单 slot 附属；吉他 / 尤克里里 TAB） */
export function tryAddStrummingFromNote(editSlot: SlotData): boolean {
  const anchor = resolveSlotAnchor(editSlot)
  if (!anchor) return false
  if (listStrummingsOnSlot(anchor.musicScore, anchor.slotId).length > 0) return false

  addSlotAffiliatedSymbol(
    anchor.slot,
    createStrumming({measureHeight: anchor.measureHeight, arrow: true}),
  )
  return true
}

/** 前奏括号左 `(`（皮肤 timeSigParensLeft / prelude_bracket_left） */
export function tryAddPreludeBracketLeftFromNote(editSlot: SlotData): boolean {
  const anchor = resolveSlotAnchor(editSlot)
  if (!anchor) return false
  if (listPreludeBracketLeftOnSlot(anchor.musicScore, anchor.slotId).length > 0) return false

  addSlotAffiliatedSymbol(anchor.slot, createPreludeBracketLeft())
  return true
}

/** 前奏括号右 `)`（皮肤 timeSigParensRight / prelude_bracket_right） */
export function tryAddPreludeBracketRightFromNote(editSlot: SlotData): boolean {
  const anchor = resolveSlotAnchor(editSlot)
  if (!anchor) return false
  if (listPreludeBracketRightOnSlot(anchor.musicScore, anchor.slotId).length > 0) return false

  addSlotAffiliatedSymbol(anchor.slot, createPreludeBracketRight())
  return true
}

export function resolveDoubleSlotIds(
  editSlot: SlotData,
  span: SlotSymbolSpan,
): {startId: string; endId: string} | null {
  const anchor = resolveSlotAnchor(editSlot)
  if (!anchor) return null
  if (span <= 1) {
    return {startId: anchor.slotId, endId: anchor.slotId}
  }
  const endId = findSlotIdAtRightOffset(
    anchor.singleStaff,
    anchor.measureIndex,
    anchor.noteIndex,
    span - 1,
    anchor.voice,
  )
  if (!endId) return null
  return {startId: anchor.slotId, endId}
}

/** 从当前列向右跨 span 列添加踏板；span=1 时起止同一 slot */
export function tryAddPedalFromNote(editSlot: SlotData, span: SlotSymbolSpan): boolean {
  const ids = resolveDoubleSlotIds(editSlot, span)
  if (!ids) return false
  const musicScore = editSlot.musicScore as MusicScore
  ensureAffiliatedSymbols(musicScore)
  musicScore.affiliatedSymbols.push(
    createPedal({
      startId: ids.startId,
      endId: ids.endId,
    }),
  )
  return true
}

/** 从当前列向右跨 span 列添加升/降八度记号；span=1 时起止同一 slot */
export function tryAddPitchFromNote(
  editSlot: SlotData,
  span: SlotSymbolSpan,
  direction: PitchDirection,
): boolean {
  const ids = resolveDoubleSlotIds(editSlot, span)
  if (!ids) return false
  const musicScore = editSlot.musicScore as MusicScore
  ensureAffiliatedSymbols(musicScore)
  musicScore.affiliatedSymbols.push(
    createPitch({
      startId: ids.startId,
      endId: ids.endId,
      direction,
    }),
  )
  return true
}

const LINE_NAMES = new Set<string>([
  DoubleSlotAffiliatedSymbolNameEnum.Trill_line,
  DoubleSlotAffiliatedSymbolNameEnum.Hairpin,
  DoubleSlotAffiliatedSymbolNameEnum.Guzheng_lian,
])

/** 颤音线 / 渐强渐弱 / 古筝连续指法（起点为当前列） */
export function listLinesStartingAt(
  musicScore: MusicScore,
  startId: string,
): DoubleSlotAffiliatedSymbol[] {
  return musicScore.affiliatedSymbols.filter(
    (sym): sym is DoubleSlotAffiliatedSymbol =>
      LINE_NAMES.has(String(sym.name))
      && 'startId' in sym
      && sym.startId === startId,
  )
}

/** 从当前列向右跨 span 列添加颤音线 */
export function tryAddTrillFromNote(
  editSlot: SlotData,
  span: SlotSymbolSpan,
  type: TrillTypeEnum = TrillTypeEnum.Trill,
): boolean {
  const ids = resolveDoubleSlotIds(editSlot, span)
  if (!ids) return false
  const musicScore = editSlot.musicScore as MusicScore
  ensureAffiliatedSymbols(musicScore)
  musicScore.affiliatedSymbols.push(createTrill({...ids, type}))
  return true
}

/** 从当前列向右跨 span 列添加渐强 / 渐弱 */
export function tryAddHairpinFromNote(
  editSlot: SlotData,
  span: SlotSymbolSpan,
  type: HairpinTypeEnum,
): boolean {
  const ids = resolveDoubleSlotIds(editSlot, span)
  if (!ids) return false
  const musicScore = editSlot.musicScore as MusicScore
  ensureAffiliatedSymbols(musicScore)
  musicScore.affiliatedSymbols.push(createHairpin({...ids, type}))
  return true
}

/** 从当前列向右跨 span 列添加古筝连续指法（连托 / 连劈 / 连抹 …） */
export function tryAddGuzhengLianFromNote(
  editSlot: SlotData,
  span: SlotSymbolSpan,
  type: GuzhengLianTypeEnum,
): boolean {
  const ids = resolveDoubleSlotIds(editSlot, span)
  if (!ids) return false
  const musicScore = editSlot.musicScore as MusicScore
  ensureAffiliatedSymbols(musicScore)
  musicScore.affiliatedSymbols.push(createGuzhengLian({...ids, type}))
  return true
}

export function pitchSymbolLabelKey(sym: DoubleSlotAffiliatedSymbol): 'addPitchUp' | 'addPitchDown' {
  return sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_down
    ? 'addPitchDown'
    : 'addPitchUp'
}

/** 属性栏列表用：把选中 note 解析成 MeasureNoteSlot.id */
export function resolveSelectedSlotId(editSlot: SlotData): string | null {
  const {measure, note} = editSlot
  if (!measure || !note) return null
  const {voice, index} = locateMeasureNote(measure, note)
  if (index < 0) return null
  return measureVoiceSlots(measure, voice)[index]!.id
}
