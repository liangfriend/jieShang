import {
  DoubleNoteAffiliatedSymbolNameEnum,
  SlurStyleEnum,
  getMeasureSlots,
  isNoteRest,
  isNoteSymbol
} from '@deciphony/renderer'
import type {
  DoubleNoteAffiliatedSymbol,
  MusicScore,
  NoteNumber,
  SingleStaff,
  SlotData,
  StaffSlot,
} from '@deciphony/renderer'
import {
  locateNotesInfoById,
  locateNotesNumberInfoById,
  locateTabNoteInfoById,
} from '@deciphony/extensions/dr-edit/score-builder'
import {isNoteNumberSlot, isSlotRestLike} from '@deciphony/extensions/dr-edit/score-builder'
import {asStaffOrNumber} from './asStaffOrNumber'

export const DEFAULT_SLUR_THICKNESS = 4
export const SLUR_THICKNESS_MIN = 2
export const SLUR_THICKNESS_MAX = 12

/** musicScore.data 上的连音线造型偏好；缺省 / 删除表示「默认」（按谱种） */
export const SCORE_DATA_SLUR_STYLE = 'slurStyle'

/** 工具栏 / 属性栏：默认 | 圆润 | 尖锐 */
export type SlurStylePreference = SlurStyleEnum | 'default'

export const SLUR_STYLE_PREFERENCE_VALUES: readonly SlurStylePreference[] = [
  'default',
  SlurStyleEnum.Rounded,
  SlurStyleEnum.Sharp,
]

export type SlurSpan = 2 | 3 | 4
export const SLUR_SPAN_OPTIONS: SlurSpan[] = [2, 3, 4]

function ensureMusicScoreData(score: MusicScore): Record<string, unknown> {
  const raw = score as MusicScore & {data?: Record<string, unknown>}
  if (!raw.data || typeof raw.data !== 'object') raw.data = {}
  return raw.data
}

function asSlurStylePreference(value: unknown): SlurStylePreference {
  if (value === SlurStyleEnum.Rounded || value === 'rounded') return SlurStyleEnum.Rounded
  if (value === SlurStyleEnum.Sharp || value === 'sharp') return SlurStyleEnum.Sharp
  return 'default'
}

/** 读曲谱默认连音线造型；旧谱无字段 → 默认 */
export function readScoreSlurStyle(score: MusicScore): SlurStylePreference {
  const data = (score as MusicScore & {data?: Record<string, unknown>}).data
  return asSlurStylePreference(data?.[SCORE_DATA_SLUR_STYLE])
}

/** 写入曲谱默认连音线造型；选「默认」时删除字段以兼容旧谱 */
export function applyScoreSlurStyle(score: MusicScore, preference: SlurStylePreference): void {
  const data = ensureMusicScoreData(score)
  if (preference === 'default') delete data[SCORE_DATA_SLUR_STYLE]
  else data[SCORE_DATA_SLUR_STYLE] = preference
}

export type SlurHandleKind = 'start' | 'control' | 'end'

export type SlurHandlePoints = {
  start: { x: number; y: number }
  control: { x: number; y: number }
  end: { x: number; y: number }
}

export type SlurDragSession = {
  pointerId: number
  slurId: string
  handle: SlurHandleKind
  baseStart: { x: number; y: number }
  baseEnd: { x: number; y: number }
}

export type SlurEditSlot = SlotData & {self: DoubleNoteAffiliatedSymbol}

export function ensureSlurData(sym: DoubleNoteAffiliatedSymbol) {
  if (!sym.data.slur) {
    sym.data.slur = {
      relativeStartPoint: {x: 0, y: 0},
      relativeEndPoint: {x: 0, y: 0},
      relativeControlPoint: {x: 0, y: 0},
      thickness: DEFAULT_SLUR_THICKNESS,
    }
  }
  return sym.data.slur
}

export function getSlurThickness(sym: DoubleNoteAffiliatedSymbol): number {
  return ensureSlurData(sym).thickness ?? DEFAULT_SLUR_THICKNESS
}

export function setSlurThickness(sym: DoubleNoteAffiliatedSymbol, thickness: number): void {
  const clamped = Math.min(SLUR_THICKNESS_MAX, Math.max(SLUR_THICKNESS_MIN, Math.round(thickness)))
  ensureSlurData(sym).thickness = clamped
}

/** 单条连音线造型；无 style → 默认（按谱种） */
export function getSlurStyle(sym: DoubleNoteAffiliatedSymbol): SlurStylePreference {
  return asSlurStylePreference(ensureSlurData(sym).style)
}

export function setSlurStyle(sym: DoubleNoteAffiliatedSymbol, preference: SlurStylePreference): void {
  const slur = ensureSlurData(sym)
  if (preference === 'default') delete slur.style
  else slur.style = preference
}

/** 新建连音线时套用曲谱 data.slurStyle；默认则不写 style */
export function applyScoreSlurStyleToNewSlur(
  score: MusicScore,
  sym: DoubleNoteAffiliatedSymbol,
): void {
  const preference = readScoreSlurStyle(score)
  if (preference !== 'default') setSlurStyle(sym, preference)
}

/** 控制点水平居中于起止点之间（relativeControlPoint.x = 0），y 不变 */
export function centerSlurControlPoint(sym: DoubleNoteAffiliatedSymbol): void {
  const slur = ensureSlurData(sym)
  slur.relativeControlPoint = {x: 0, y: slur.relativeControlPoint?.y ?? 0}
}

export type SlurApplyScope = 'measure' | 'singleStaff' | 'grandStaff' | 'score'
export const SLUR_APPLY_SCOPES: SlurApplyScope[] = ['measure', 'singleStaff', 'grandStaff', 'score']

function locateSlurStart(musicScore: MusicScore, startId: string) {
  return (
    locateNotesInfoById(musicScore, startId)
    ?? locateNotesNumberInfoById(musicScore, startId)
    ?? locateTabNoteInfoById(musicScore, startId)
  )
}

/** 把 source 的起点 / 终点 / 控制点相对值复制到范围内（按起点音符所在位置判断）的其它连音线；返回改动数 */
export function applySlurRelativeToScope(
  musicScore: MusicScore,
  source: DoubleNoteAffiliatedSymbol,
  scope: SlurApplyScope,
): number {
  const src = ensureSlurData(source)
  const anchor = scope === 'score' ? null : locateSlurStart(musicScore, source.startId)
  if (scope !== 'score' && !anchor) return 0

  let changed = 0
  for (const sym of musicScore.affiliatedSymbols) {
    if (sym.name !== DoubleNoteAffiliatedSymbolNameEnum.Slur || sym.id === source.id) continue
    const slurSym = sym as DoubleNoteAffiliatedSymbol
    if (anchor) {
      const loc = locateSlurStart(musicScore, slurSym.startId)
      if (!loc) continue
      if (scope === 'measure' && loc.measure.id !== anchor.measure.id) continue
      if (scope === 'singleStaff' && loc.singleStaff.id !== anchor.singleStaff.id) continue
      if (scope === 'grandStaff' && loc.grandStaff.id !== anchor.grandStaff.id) continue
    }
    const target = ensureSlurData(slurSym)
    target.relativeStartPoint = {...src.relativeStartPoint}
    target.relativeEndPoint = {...src.relativeEndPoint}
    target.relativeControlPoint = {...src.relativeControlPoint}
    changed++
  }
  return changed
}

/** 以当前音符为起点的连音线（musicScore.affiliatedSymbols 中 startId 匹配） */
export function listSlursStartingAtNotesInfo(
  musicScore: MusicScore,
  notesInfoId: string,
): DoubleNoteAffiliatedSymbol[] {
  return musicScore.affiliatedSymbols.filter(
    (sym): sym is DoubleNoteAffiliatedSymbol =>
      sym.name === DoubleNoteAffiliatedSymbolNameEnum.Slur && sym.startId === notesInfoId,
  )
}

export function removeSlur(musicScore: MusicScore, slurId: string): boolean {
  const idx = musicScore.affiliatedSymbols.findIndex((sym) => sym.id === slurId)
  if (idx < 0) return false
  musicScore.affiliatedSymbols.splice(idx, 1)
  return true
}

type SlurEndAnchor = {
  singleStaff: SingleStaff
  measureIndex: number
  noteIndex: number
}

export type StaffMeasureRef = {
  singleStaff: SingleStaff
  measureIndex: number
}

/** 相邻小节：本单谱表内越界时，接到上 / 下一个复谱表中同索引的单谱表 */
export function adjacentStaffMeasure(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  measureIndex: number,
  step: 1 | -1,
): StaffMeasureRef | null {
  const target = measureIndex + step
  if (target >= 0 && target < singleStaff.measures.length) return {singleStaff, measureIndex: target}

  const grandStaffs = musicScore.grandStaffs
  const grandIndex = grandStaffs.findIndex((gs) => gs.staves.some((s) => s.id === singleStaff.id))
  if (grandIndex < 0) return null
  const staffIndex = grandStaffs[grandIndex]!.staves.findIndex((s) => s.id === singleStaff.id)
  const nextStaff = grandStaffs[grandIndex + step]?.staves[staffIndex]
  if (!nextStaff || nextStaff.measures.length === 0) return null
  return {singleStaff: nextStaff, measureIndex: step > 0 ? 0 : nextStaff.measures.length - 1}
}

function isRestSlot(slot: StaffSlot | NoteNumber): boolean {
  if (isNoteRest(slot)) return true
  return isNoteNumberSlot(slot) && isSlotRestLike(slot)
}

function firstInfoIdOfSlot(slot: StaffSlot | NoteNumber): string | null {
  if (isNoteRest(slot)) return null
  if (isNoteSymbol(slot)) return slot.notesInfo[0]?.id ?? null
  if (isNoteNumberSlot(slot)) {
    if (isSlotRestLike(slot)) return null
    return slot.notesInfo[0]?.id ?? null
  }
  return null
}

function locateSlurEndAnchor(musicScore: MusicScore, endId: string): SlurEndAnchor | null {
  const standard = locateNotesInfoById(musicScore, endId)
  if (standard) {
    return {
      singleStaff: standard.singleStaff,
      measureIndex: standard.measureIndex,
      noteIndex: standard.noteIndex,
    }
  }
  const jianpu = locateNotesNumberInfoById(musicScore, endId)
  if (jianpu) {
    return {
      singleStaff: jianpu.singleStaff,
      measureIndex: jianpu.measureIndex,
      noteIndex: jianpu.noteIndex,
    }
  }
  return null
}

/** 前一个音符位的 notesInfo[0]；遇休止符或越界则 null */
function findPreviousNoteInfoId(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  measureIndex: number,
  noteIndex: number,
): string | null {
  let staff = singleStaff
  let mi = measureIndex
  let ni = noteIndex - 1

  for (;;) {
    while (ni < 0) {
      const prev = adjacentStaffMeasure(musicScore, staff, mi, -1)
      if (!prev) return null
      staff = prev.singleStaff
      mi = prev.measureIndex
      ni = getMeasureSlots(staff.measures[mi]!).length - 1
    }

    const slot = asStaffOrNumber(getMeasureSlots(staff.measures[mi]!)[ni]!)
    if (isRestSlot(slot)) return null
    const infoId = firstInfoIdOfSlot(slot)
    if (infoId) return infoId
    ni -= 1
  }
}

/** 后一个音符位的 notesInfo[0]；遇休止符或越界则 null */
function findNextNoteInfoId(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  measureIndex: number,
  noteIndex: number,
): string | null {
  let staff = singleStaff
  let mi = measureIndex
  let ni = noteIndex + 1

  for (;;) {
    const slots = getMeasureSlots(staff.measures[mi]!)

    if (ni >= slots.length) {
      const next = adjacentStaffMeasure(musicScore, staff, mi, 1)
      if (!next) return null
      staff = next.singleStaff
      mi = next.measureIndex
      ni = 0
      continue
    }

    const slot = asStaffOrNumber(slots[ni]!)
    if (isRestSlot(slot)) return null
    const infoId = firstInfoIdOfSlot(slot)
    if (infoId) return infoId
    ni += 1
  }
}

export function canMoveSlurEndEarlier(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false
  const prevId = findPreviousNoteInfoId(musicScore, anchor.singleStaff, anchor.measureIndex, anchor.noteIndex)
  return prevId != null && prevId !== slur.startId
}

export function canMoveSlurEndLater(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false
  return findNextNoteInfoId(musicScore, anchor.singleStaff, anchor.measureIndex, anchor.noteIndex) != null
}

/** 尾部前移：endId → 前一音符 notesInfo[0]，直到前一为 startId 或休止符 */
export function moveSlurEndEarlier(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false

  const prevId = findPreviousNoteInfoId(musicScore, anchor.singleStaff, anchor.measureIndex, anchor.noteIndex)
  if (!prevId || prevId === slur.startId) return false

  slur.endId = prevId
  return true
}

/** 尾部后移：endId → 后一音符 notesInfo[0]，直到单谱表末音或休止符 */
export function moveSlurEndLater(
  musicScore: MusicScore,
  slur: DoubleNoteAffiliatedSymbol,
): boolean {
  const anchor = locateSlurEndAnchor(musicScore, slur.endId)
  if (!anchor) return false

  const nextId = findNextNoteInfoId(musicScore, anchor.singleStaff, anchor.measureIndex, anchor.noteIndex)
  if (!nextId) return false

  slur.endId = nextId
  return true
}
