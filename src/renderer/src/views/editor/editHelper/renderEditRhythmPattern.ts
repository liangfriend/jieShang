/**
 * 音值组合输入：选中小节按空格，保持音名不变，列出节奏型。两种模式：
 * - 按小节：所有音恰好占满本小节。小节按拍切分，每段放一个「节奏单元」（单拍型如二八 / 前八后十六 / 小附点，
 *   跨拍型如大切分 / 大附点 / 长音），枚举所有组合后按常用程度排序，常见、整齐的排在前面。
 * - 按拍：只取小节末尾尚未组合的音（往前遇到带组合标记的槽位为止），恰好占满一拍；
 *   选定后在组内最后一个槽位的 data 上打组合标记，下次按空格从标记之后的新音开始。
 */
import {
  BeamTypeEnum,
  MusicScoreTypeEnum,
  TimeSignatureTypeEnum,
  isMeasureNoteVoices,
  timeSignatureTypeToBeats,
  type AugmentationDot,
  type Chronaxie,
  type Measure,
  type MeasureNoteSlot,
  type MusicScore,
  type SingleStaff,
  type SlotData
} from '@deciphony/renderer'
import { DRUM_MAX_CHRONAXIE, type DrumVoice } from '@deciphony/extensions/dr-edit'
import {
  chronaxieWithDots,
  createAugmentationDot,
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff,
  newId,
  resolveAutoBeamType
} from '@deciphony/extensions/dr-edit/score-builder'
import { isTabNotationType } from '@renderer/utils/isTabNotation'
import { isMeasureAddMode } from './standardStaff/renderEditSymbolAddAction'

export type RhythmNoteValue = { chronaxie: Chronaxie; dots: 0 | 1 | 2 }

export type RhythmPatternMode = 'measure' | 'beat'

export type RhythmPatternOption = {
  /** 时值序列签名（按拍模式再加符杠分组），兼作列表 key */
  id: string
  shortcut: string | null
  values: RhythmNoteValue[]
  /** 按拍模式：每条符杠覆盖的时值长度（256 单位），从组首起按此长度断开符杠；按小节模式为 null */
  beamSpan: number | null
  preview: MusicScore
}

export type RhythmPatternTarget = {
  mode: RhythmPatternMode
  measure: Measure
  voice: DrumVoice
  slots: MeasureNoteSlot[]
  timeSignature: TimeSignatureTypeEnum
  /** 按拍模式：一拍放不下而未参与组合的音数（组内靠前的那些） */
  skipped: number
}

const RHYTHM_PATTERN_MODE_STORAGE_KEY = 'editor.rhythmPattern.mode.v2'

export function loadRhythmPatternMode(): RhythmPatternMode {
  try {
    return localStorage.getItem(RHYTHM_PATTERN_MODE_STORAGE_KEY) === 'measure' ? 'measure' : 'beat'
  } catch {
    return 'beat'
  }
}

export function saveRhythmPatternMode(mode: RhythmPatternMode): void {
  try {
    localStorage.setItem(RHYTHM_PATTERN_MODE_STORAGE_KEY, mode)
  } catch {
    /* noop */
  }
}

/** 按拍组合的组尾标记：存于 MeasureNoteSlot.data */
export const RHYTHM_GROUP_END_KEY = 'rhythmGroupEnd'

export function isRhythmGroupEnd(slot: MeasureNoteSlot): boolean {
  const data = slot.data as Record<string, unknown> | null | undefined
  return data?.[RHYTHM_GROUP_END_KEY] === true
}

export function setRhythmGroupEnd(slot: MeasureNoteSlot, value: boolean): void {
  if (!slot.data || typeof slot.data !== 'object') slot.data = {}
  ;(slot.data as Record<string, unknown>)[RHYTHM_GROUP_END_KEY] = value
}

/** 节奏单元：units 为拍内细分单位的时值序列（总和须为整拍）；cost 越小越常用、越靠前 */
type RhythmCell = { units: readonly number[]; cost: number }

/**
 * 单拍子（x/4、x/2、5/8、7/8…）：1 拍 = 8 个单位，即四分拍下 1 单位 = 三十二分。
 * 不收录能由更短的整拍单元拼出来的组合（如 [8,4,4]），避免重复。
 */
const SIMPLE_UNITS_PER_BEAT = 8
const SIMPLE_CELLS: readonly RhythmCell[] = [
  // 一拍
  { units: [8], cost: 0 },
  { units: [4, 4], cost: 0 },
  { units: [2, 2, 2, 2], cost: 0.2 },
  { units: [4, 2, 2], cost: 0.3 },
  { units: [2, 2, 4], cost: 0.3 },
  { units: [6, 2], cost: 0.4 },
  { units: [2, 4, 2], cost: 0.6 },
  { units: [2, 6], cost: 0.8 },
  { units: [1, 1, 1, 1, 1, 1, 1, 1], cost: 1.2 },
  { units: [2, 2, 2, 1, 1], cost: 1.5 },
  { units: [1, 1, 2, 2, 2], cost: 1.5 },
  { units: [4, 1, 1, 1, 1], cost: 1.6 },
  { units: [1, 1, 1, 1, 4], cost: 1.6 },
  { units: [2, 2, 1, 1, 1, 1], cost: 1.6 },
  { units: [1, 1, 1, 1, 2, 2], cost: 1.6 },
  { units: [6, 1, 1], cost: 1.8 },
  { units: [7, 1], cost: 2.2 },
  // 两拍
  { units: [16], cost: 0.1 },
  { units: [12, 4], cost: 0.4 },
  { units: [4, 8, 4], cost: 0.6 },
  { units: [4, 12], cost: 0.9 },
  { units: [12, 2, 2], cost: 1 },
  { units: [2, 2, 12], cost: 1.4 },
  { units: [14, 2], cost: 1.6 },
  { units: [4, 8, 2, 2], cost: 1.4 },
  { units: [2, 2, 8, 4], cost: 1.6 },
  { units: [6, 8, 2], cost: 1.8 },
  { units: [2, 8, 6], cost: 2 },
  { units: [2, 4, 4, 4, 2], cost: 2 },
  // 三拍
  { units: [24], cost: 0.3 },
  { units: [12, 12], cost: 1.2 },
  { units: [4, 16, 4], cost: 1.4 },
  { units: [12, 8, 4], cost: 1.5 },
  // 四拍
  { units: [32], cost: 0.3 },
  { units: [28, 4], cost: 2 }
]

/** 复拍子（3/8、6/8、9/8、12/8）：1 拍 = 附点四分 = 6 个单位（十六分） */
const COMPOUND_UNITS_PER_BEAT = 6
const COMPOUND_CELLS: readonly RhythmCell[] = [
  // 一拍
  { units: [6], cost: 0 },
  { units: [4, 2], cost: 0 },
  { units: [2, 2, 2], cost: 0 },
  { units: [2, 4], cost: 0.3 },
  { units: [3, 1, 2], cost: 0.5 },
  { units: [2, 2, 1, 1], cost: 0.5 },
  { units: [1, 1, 2, 2], cost: 0.5 },
  { units: [2, 1, 1, 2], cost: 0.5 },
  { units: [1, 1, 1, 1, 1, 1], cost: 0.6 },
  { units: [4, 1, 1], cost: 0.8 },
  { units: [3, 3], cost: 1 },
  { units: [1, 1, 1, 1, 2], cost: 1 },
  { units: [2, 1, 1, 1, 1], cost: 1 },
  { units: [1, 1, 2, 1, 1], cost: 1 },
  { units: [1, 1, 4], cost: 1.3 },
  { units: [3, 1, 1, 1], cost: 1.3 },
  // 两拍
  { units: [12], cost: 0.1 },
  { units: [4, 4, 4], cost: 1.2 },
  // 四拍
  { units: [24], cost: 0.3 }
]

/** 相邻单元换型的代价：同型重复（全二八、全四十六…）优先 */
const CELL_CHANGE_COST = 0.25
/** 多拍单元不从自身拍数的整数倍处起（如 4/4 第二拍起二分）算切分，往后排 */
const OFFBEAT_LONG_CELL_COST = 0.6
/** 单张谱面最多展示的卡片数 */
const MAX_OPTIONS = 60
/** 最优优先搜索的弹出上限，防止 12/8 等长小节、音多时卡顿 */
const MAX_SEARCH_POPS = 60_000

/** 主键盘数字 → 字母 → 小键盘数字 → 小键盘运算符；超出的卡片只能用鼠标 / 方向键选 */
const SHORTCUT_CODES: readonly { code: string; label: string }[] = [
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => ({ code: `Digit${d}`, label: d })),
  ...Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i)
    return { code: `Key${letter}`, label: letter }
  }),
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => ({
    code: `Numpad${d}`,
    label: `Num${d}`
  })),
  { code: 'NumpadDecimal', label: 'Num.' },
  { code: 'NumpadAdd', label: 'Num+' },
  { code: 'NumpadSubtract', label: 'Num-' },
  { code: 'NumpadMultiply', label: 'Num*' },
  { code: 'NumpadDivide', label: 'Num/' }
]

export function rhythmPatternIndexForCode(code: string): number {
  return SHORTCUT_CODES.findIndex((item) => item.code === code)
}

const BASE_CHRONAXIES: readonly Chronaxie[] = [256, 128, 64, 32, 16, 8, 4, 2, 1]

function toNoteValue(duration: number, maxChronaxie: number): RhythmNoteValue | null {
  for (const chronaxie of BASE_CHRONAXIES) {
    if (chronaxie > maxChronaxie) continue
    if (duration === chronaxie) return { chronaxie, dots: 0 }
    if (duration === chronaxie * 1.5) return { chronaxie, dots: 1 }
    if (duration === chronaxie * 1.75) return { chronaxie, dots: 2 }
  }
  return null
}

function toNoteValues(durations: number[], maxChronaxie: number): RhythmNoteValue[] | null {
  const values: RhythmNoteValue[] = []
  for (const duration of durations) {
    const value = toNoteValue(duration, maxChronaxie)
    if (!value) return null
    values.push(value)
  }
  return values
}

type MeterGrid = {
  beats: number
  beatChronaxie: number
  unitsPerBeat: number
  cells: readonly RhythmCell[]
}

function resolveMeterGrid(timeSignature: TimeSignatureTypeEnum): MeterGrid {
  const { beats, beatType } = timeSignatureTypeToBeats(timeSignature)
  const noteChronaxie = 256 / beatType
  if (beatType === 8 && beats % 3 === 0) {
    return {
      beats: beats / 3,
      beatChronaxie: noteChronaxie * 3,
      unitsPerBeat: COMPOUND_UNITS_PER_BEAT,
      cells: COMPOUND_CELLS
    }
  }
  return {
    beats,
    beatChronaxie: noteChronaxie,
    unitsPerBeat: SIMPLE_UNITS_PER_BEAT,
    cells: SIMPLE_CELLS
  }
}

type UsableCell = { values: RhythmNoteValue[]; beats: number; cost: number }

/** 换算成可记谱的时值；再补一个「整小节一个音」（如 5/4、6/4 的长音） */
function resolveUsableCells(grid: MeterGrid, maxChronaxie: number): UsableCell[] {
  const unitChronaxie = grid.beatChronaxie / grid.unitsPerBeat
  const cells: RhythmCell[] = [...grid.cells]
  const measureUnits = grid.beats * grid.unitsPerBeat
  if (!cells.some((cell) => cell.units.length === 1 && cell.units[0] === measureUnits)) {
    cells.push({ units: [measureUnits], cost: 0.5 })
  }
  const usable: UsableCell[] = []
  for (const cell of cells) {
    const total = cell.units.reduce((sum, u) => sum + u, 0)
    const beats = total / grid.unitsPerBeat
    if (!Number.isInteger(beats) || beats > grid.beats) continue
    const values = toNoteValues(cell.units.map((u) => u * unitChronaxie), maxChronaxie)
    if (values) usable.push({ values, beats, cost: cell.cost })
  }
  return usable
}

/** reach[b][n]：b 拍能否恰好放下 n 个音 */
function buildReachTable(cells: UsableCell[], beats: number, notes: number): boolean[][] {
  const reach = Array.from({ length: beats + 1 }, () => new Array<boolean>(notes + 1).fill(false))
  reach[0]![0] = true
  for (let b = 1; b <= beats; b++) {
    for (const cell of cells) {
      if (cell.beats > b) continue
      const prev = reach[b - cell.beats]!
      for (let n = cell.values.length; n <= notes; n++) {
        if (prev[n - cell.values.length]) reach[b]![n] = true
      }
    }
  }
  return reach
}

type SearchNode = {
  cost: number
  order: number
  beat: number
  notes: number
  lastCell: number
  values: RhythmNoteValue[]
}

/** 最小堆（cost 相同按入堆顺序，保证结果稳定） */
class NodeHeap {
  private items: SearchNode[] = []

  get size() {
    return this.items.length
  }

  private less(a: SearchNode, b: SearchNode) {
    return a.cost < b.cost || (a.cost === b.cost && a.order < b.order)
  }

  push(node: SearchNode) {
    const items = this.items
    items.push(node)
    let i = items.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (!this.less(items[i]!, items[parent]!)) break
      ;[items[i], items[parent]] = [items[parent]!, items[i]!]
      i = parent
    }
  }

  pop(): SearchNode | undefined {
    const items = this.items
    const top = items[0]
    const last = items.pop()
    if (items.length && last) {
      items[0] = last
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let best = i
        if (l < items.length && this.less(items[l]!, items[best]!)) best = l
        if (r < items.length && this.less(items[r]!, items[best]!)) best = r
        if (best === i) break
        ;[items[i], items[best]] = [items[best]!, items[i]!]
        i = best
      }
    }
    return top
  }
}

function valuesSignature(values: RhythmNoteValue[]): string {
  return values.map((v) => `${v.chronaxie}${'.'.repeat(v.dots)}`).join(' ')
}

/** 按常用程度从高到低列出 notes 个音恰好占满一小节的时值序列 */
export function enumerateRhythmPatterns(
  notes: number,
  timeSignature: TimeSignatureTypeEnum,
  maxChronaxie: number,
  limit = MAX_OPTIONS
): RhythmNoteValue[][] {
  if (notes <= 0) return []
  const grid = resolveMeterGrid(timeSignature)
  const cells = resolveUsableCells(grid, maxChronaxie)
  const reach = buildReachTable(cells, grid.beats, notes)
  if (!reach[grid.beats]![notes]) return []

  const results: RhythmNoteValue[][] = []
  const seen = new Set<string>()
  const heap = new NodeHeap()
  let order = 0
  heap.push({ cost: 0, order: order++, beat: 0, notes: 0, lastCell: -1, values: [] })

  for (let pops = 0; heap.size && pops < MAX_SEARCH_POPS && results.length < limit; pops++) {
    const node = heap.pop()!
    if (node.beat === grid.beats) {
      const key = valuesSignature(node.values)
      if (!seen.has(key)) {
        seen.add(key)
        results.push(node.values)
      }
      continue
    }
    cells.forEach((cell, index) => {
      const beat = node.beat + cell.beats
      const used = node.notes + cell.values.length
      if (beat > grid.beats || used > notes) return
      if (!reach[grid.beats - beat]![notes - used]) return
      const cost =
        node.cost +
        cell.cost +
        (node.lastCell >= 0 && node.lastCell !== index ? CELL_CHANGE_COST : 0) +
        (cell.beats > 1 && node.beat % cell.beats !== 0 ? OFFBEAT_LONG_CELL_COST : 0)
      heap.push({
        cost,
        order: order++,
        beat,
        notes: used,
        lastCell: index,
        values: [...node.values, ...cell.values]
      })
    })
  }
  return results
}

// ---------- 按拍 ----------

/** 按拍模式的最小时值：六十四分（四分拍一拍最多 16 个音） */
const BEAT_MODE_UNIT_CHRONAXIE = 4
/** 按拍打分：附点、拍内切分（音不落在自身时值的整数倍上）、相邻换时值都往后排 */
const BEAT_DOT_COST = 0.4
const BEAT_OFFGRID_COST = 0.5
const BEAT_CHANGE_COST = 0.25
/** 短于四分才连符杠 */
const BEAMABLE_MAX_CHRONAXIE = 32

type BeatGrid = {
  beatChronaxie: number
  units: number
  /** 一拍再分几段（单拍子 2，复拍子 3），用于「按半拍 / 三分之一拍断开符杠」 */
  subdivisions: number
}

function resolveBeatGrid(timeSignature: TimeSignatureTypeEnum): BeatGrid {
  const grid = resolveMeterGrid(timeSignature)
  const compound = grid.cells === COMPOUND_CELLS
  return {
    beatChronaxie: grid.beatChronaxie,
    units: grid.beatChronaxie / BEAT_MODE_UNIT_CHRONAXIE,
    subdivisions: compound ? 3 : 2
  }
}

/** 一拍最多放几个音 */
export function maxNotesPerBeat(timeSignature: TimeSignatureTypeEnum): number {
  return resolveBeatGrid(timeSignature).units
}

type BeatDuration = { units: number; value: RhythmNoteValue }

function resolveBeatDurations(grid: BeatGrid, maxChronaxie: number): BeatDuration[] {
  const durations: BeatDuration[] = []
  for (const chronaxie of BASE_CHRONAXIES) {
    if (chronaxie > maxChronaxie || chronaxie < BEAT_MODE_UNIT_CHRONAXIE) continue
    for (const dots of [0, 1, 2] as const) {
      const units = chronaxieWithDots(chronaxie, dots) / BEAT_MODE_UNIT_CHRONAXIE
      if (!Number.isInteger(units) || units > grid.units) continue
      durations.push({ units, value: { chronaxie, dots } })
    }
  }
  return durations
}

/** 按常用程度列出 notes 个音恰好占满一拍的时值序列 */
export function enumerateBeatRhythmPatterns(
  notes: number,
  timeSignature: TimeSignatureTypeEnum,
  maxChronaxie: number,
  limit = MAX_OPTIONS
): RhythmNoteValue[][] {
  const grid = resolveBeatGrid(timeSignature)
  if (notes <= 0 || notes > grid.units) return []
  const durations = resolveBeatDurations(grid, maxChronaxie)

  // reach[u][n]：u 个单位能否恰好放下 n 个音
  const reach = Array.from({ length: grid.units + 1 }, () => new Array<boolean>(notes + 1).fill(false))
  reach[0]![0] = true
  for (let u = 1; u <= grid.units; u++) {
    for (const d of durations) {
      if (d.units > u) continue
      for (let n = 1; n <= notes; n++) {
        if (reach[u - d.units]![n - 1]) reach[u]![n] = true
      }
    }
  }
  if (!reach[grid.units]![notes]) return []

  const results: RhythmNoteValue[][] = []
  const heap = new NodeHeap()
  let order = 0
  // beat 字段复用为「已占单位数」，lastCell 复用为上一个音的单位数
  heap.push({ cost: 0, order: order++, beat: 0, notes: 0, lastCell: -1, values: [] })

  for (let pops = 0; heap.size && pops < MAX_SEARCH_POPS && results.length < limit; pops++) {
    const node = heap.pop()!
    if (node.beat === grid.units) {
      results.push(node.values)
      continue
    }
    for (const d of durations) {
      const pos = node.beat + d.units
      const used = node.notes + 1
      if (pos > grid.units || used > notes) continue
      if (!reach[grid.units - pos]![notes - used]) continue
      const baseUnits = d.value.chronaxie / BEAT_MODE_UNIT_CHRONAXIE
      const cost =
        node.cost +
        d.value.dots * BEAT_DOT_COST +
        (node.beat % baseUnits !== 0 ? BEAT_OFFGRID_COST : 0) +
        (node.lastCell >= 0 && node.lastCell !== d.units ? BEAT_CHANGE_COST : 0)
      heap.push({
        cost,
        order: order++,
        beat: pos,
        notes: used,
        lastCell: d.units,
        values: [...node.values, d.value]
      })
    }
  }
  return results
}

/**
 * 符杠分组方案：整拍一条；若每个分段（半拍 / 三分之一拍）都没有音跨界、且至少两段各有 2 个以上可连杠的音，
 * 再给一个按分段断开的方案。
 */
function resolveBeamSpans(values: RhythmNoteValue[], grid: BeatGrid): number[] {
  const spans = [grid.beatChronaxie]
  const segment = grid.beatChronaxie / grid.subdivisions
  if (!Number.isInteger(segment)) return spans
  const counts = new Array<number>(grid.subdivisions).fill(0)
  let onset = 0
  for (const value of values) {
    const length = chronaxieWithDots(value.chronaxie, value.dots)
    const index = Math.floor(onset / segment)
    if (Math.floor((onset + length - 1) / segment) !== index) return spans
    if (value.chronaxie <= BEAMABLE_MAX_CHRONAXIE) counts[index]! += 1
    onset += length
  }
  if (counts.filter((count) => count >= 2).length >= 2) spans.push(segment)
  return spans
}

/** 按拍：原地改时值 / 附点，符杠从组首起每 beamSpan 断开一次 */
export function applyBeatRhythmValues(
  slots: MeasureNoteSlot[],
  values: RhythmNoteValue[],
  beamSpan: number
): void {
  let onset = 0
  let prevBeamable = false
  slots.forEach((slot, index) => {
    const value = values[index]
    if (!value) return
    const { holders, beamable } = durationHolders(slot)
    const canBeam = beamable && value.chronaxie <= BEAMABLE_MAX_CHRONAXIE
    const beamType = !canBeam
      ? BeamTypeEnum.None
      : onset % beamSpan === 0 || !prevBeamable
        ? BeamTypeEnum.OnlyRight
        : BeamTypeEnum.Combined
    for (const holder of holders) {
      holder.chronaxie = value.chronaxie
      setDots(holder, value.dots)
      if (beamable) holder.beamType = beamType
    }
    prevBeamable = canBeam
    onset += chronaxieWithDots(value.chronaxie, value.dots)
  })
}

/** 按拍组合选定后：组内只保留组尾标记 */
export function markRhythmGroup(slots: MeasureNoteSlot[]): void {
  slots.forEach((slot, index) => {
    const isLast = index === slots.length - 1
    if (isLast) setRhythmGroupEnd(slot, true)
    else if (isRhythmGroupEnd(slot)) setRhythmGroupEnd(slot, false)
  })
}

/** 走到目标小节时生效的拍号（与 resolveClefAndKeyAtMeasure 同口径：目标小节只吃 _f） */
export function resolveTimeSignatureAtMeasure(
  musicScore: MusicScore,
  singleStaff: SingleStaff | null | undefined,
  measure: Measure
): TimeSignatureTypeEnum {
  let type = musicScore.timeSignature ?? TimeSignatureTypeEnum['4_4']
  for (const m of singleStaff?.measures ?? [measure]) {
    if (m.timeSignature_f) type = m.timeSignature_f.type
    if (m.id === measure.id) break
    if (m.timeSignature_b) type = m.timeSignature_b.type
  }
  return type
}

function voiceSlots(measure: Measure, voice: DrumVoice): MeasureNoteSlot[] {
  if (!isMeasureNoteVoices(measure.notes)) return voice === 'up' ? measure.notes : []
  return measure.notes[voice] ?? []
}

/**
 * 按拍模式要组合的槽位：从末尾往前，遇到带组合标记的槽位为止（末尾自身的标记不算，便于重新组合刚组过的一拍）；
 * 超过一拍能放的音数时只取靠后的那些。
 */
function resolveBeatGroup(
  slots: MeasureNoteSlot[],
  timeSignature: TimeSignatureTypeEnum
): { slots: MeasureNoteSlot[]; skipped: number } {
  let start = slots.length - 1
  while (start > 0 && !isRhythmGroupEnd(slots[start - 1]!)) start--
  const group = slots.slice(start)
  const max = maxNotesPerBeat(timeSignature)
  if (group.length <= max) return { slots: group, skipped: 0 }
  return { slots: group.slice(group.length - max), skipped: group.length - max }
}

/** 小节选中且该声部有符号时返回目标；鼓谱两声部各自独立，只看当前声部 */
export function resolveRhythmPatternTarget(
  selected: SlotData | null,
  voice: DrumVoice = 'up',
  mode: RhythmPatternMode = 'beat'
): RhythmPatternTarget | null {
  if (!isMeasureAddMode(selected)) return null
  const measure = selected.measure
  if (measure.longRest) return null
  const all = voiceSlots(measure, voice)
  if (!all.length) return null
  const timeSignature = resolveTimeSignatureAtMeasure(selected.musicScore, selected.singleStaff, measure)
  const group = mode === 'beat' ? resolveBeatGroup(all, timeSignature) : { slots: all, skipped: 0 }
  return { mode, measure, voice, slots: group.slots, timeSignature, skipped: group.skipped }
}

/** 把选中的节奏型写回谱面；按拍模式同时打组尾标记 */
export function applyRhythmPatternOption(
  target: RhythmPatternTarget,
  option: Pick<RhythmPatternOption, 'values' | 'beamSpan'>
): void {
  if (target.mode === 'beat' && option.beamSpan != null) {
    applyBeatRhythmValues(target.slots, option.values, option.beamSpan)
    markRhythmGroup(target.slots)
    return
  }
  applyRhythmValues(target.slots, option.values)
}

type DurationHolder = {
  chronaxie: Chronaxie
  augmentationDot?: AugmentationDot
  beamType?: BeamTypeEnum
}

function durationHolders(slot: MeasureNoteSlot): { holders: DurationHolder[]; beamable: boolean } {
  const body = slot.symbol as unknown as { notesInfo?: DurationHolder[]; chronaxie?: Chronaxie }
  if (Array.isArray(body.notesInfo) && body.notesInfo.length) {
    return { holders: body.notesInfo, beamable: true }
  }
  if (typeof body.chronaxie === 'number') {
    return { holders: [body as DurationHolder], beamable: false }
  }
  return { holders: [], beamable: false }
}

function setDots(holder: DurationHolder, dots: 0 | 1 | 2) {
  if (dots === 0) {
    delete holder.augmentationDot
    return
  }
  if (holder.augmentationDot) holder.augmentationDot.count = dots
  else holder.augmentationDot = createAugmentationDot(dots)
}

/** 原地改时值 / 附点并按 onset 重算符杠；音名、歌词、连音线等 id 引用保持不变 */
export function applyRhythmValues(slots: MeasureNoteSlot[], values: RhythmNoteValue[]): void {
  let onset = 0
  slots.forEach((slot, index) => {
    const value = values[index]
    if (!value) return
    const { holders, beamable } = durationHolders(slot)
    for (const holder of holders) {
      holder.chronaxie = value.chronaxie
      setDots(holder, value.dots)
      if (beamable) holder.beamType = resolveAutoBeamType(onset, value.chronaxie)
    }
    onset += chronaxieWithDots(value.chronaxie, value.dots)
  })
}

function remapIds<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(remapIds)
    return value
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of Object.keys(record)) {
      if (key === 'id' && typeof record[key] === 'string') record[key] = newId()
      else remapIds(record[key])
    }
  }
  return value
}

type PreviewLayout = { topSpaceHeight: number; height: number }

function previewLayout(type: MusicScoreTypeEnum): PreviewLayout {
  if (type === MusicScoreTypeEnum.NumberNotation) return { topSpaceHeight: 28, height: 104 }
  if (isTabNotationType(type)) return { topSpaceHeight: 24, height: 140 }
  return { topSpaceHeight: 40, height: 136 }
}

/** 预览卡片：单小节、无谱号拍号，id 全部重建以免与编辑区 SVG id 冲突 */
function buildPreviewScore(
  source: MusicScore,
  target: RhythmPatternTarget,
  values: RhythmNoteValue[],
  beamSpan: number | null
): MusicScore {
  const type = source.type
  const isNumber = type === MusicScoreTypeEnum.NumberNotation
  const voices = isMeasureNoteVoices(target.measure.notes)
  const clonedSlots = remapIds(JSON.parse(JSON.stringify(target.slots)) as MeasureNoteSlot[])
  const measure = createMeasure({ voices, widthRatioForMeasure: 1 })
  // 鼓谱预览只画当前声部，另一声部留空
  if (isMeasureNoteVoices(measure.notes)) measure.notes[target.voice] = clonedSlots
  else measure.notes = clonedSlots
  if (beamSpan != null) applyBeatRhythmValues(clonedSlots, values, beamSpan)
  else applyRhythmValues(clonedSlots, values)

  const layout = previewLayout(type)
  const score = createMusicScore({
    type,
    width: Math.min(560, Math.max(220, 90 + target.slots.length * 36)),
    height: layout.height,
    topSpaceHeight: layout.topSpaceHeight,
    measureNumber: false,
    ...(isNumber
      ? { keySignature: source.keySignature, timeSignature: target.timeSignature }
      : {})
  })
  const grandStaff = createGrandStaff({ withDefaultStaff: false, uSpace: 0, dSpace: 0 })
  const staff = createSingleStaff({
    withDefaultMeasure: false,
    notationType: type,
    uSpaceI: 0,
    dSpaceI: 0,
    uSpaceO: 0,
    dSpaceO: 0
  })
  staff.measures.push(measure)
  grandStaff.staves.push(staff)
  score.grandStaffs.push(grandStaff)
  return score
}

export function buildRhythmPatternOptions(
  musicScore: MusicScore,
  target: RhythmPatternTarget
): RhythmPatternOption[] {
  const maxChronaxie = musicScore.type === MusicScoreTypeEnum.DrumNotation ? DRUM_MAX_CHRONAXIE : 256
  const choices: { values: RhythmNoteValue[]; beamSpan: number | null }[] = []
  if (target.mode === 'beat') {
    const grid = resolveBeatGrid(target.timeSignature)
    for (const values of enumerateBeatRhythmPatterns(target.slots.length, target.timeSignature, maxChronaxie)) {
      for (const beamSpan of resolveBeamSpans(values, grid)) choices.push({ values, beamSpan })
      if (choices.length >= MAX_OPTIONS) break
    }
  } else {
    for (const values of enumerateRhythmPatterns(target.slots.length, target.timeSignature, maxChronaxie)) {
      choices.push({ values, beamSpan: null })
    }
  }
  return choices.slice(0, MAX_OPTIONS).map(({ values, beamSpan }, index) => ({
    id: beamSpan == null ? valuesSignature(values) : `${valuesSignature(values)} | ${beamSpan}`,
    shortcut: SHORTCUT_CODES[index]?.label ?? null,
    values,
    beamSpan,
    preview: buildPreviewScore(musicScore, target, values, beamSpan)
  }))
}
