import type { DrumBlock, DrumMachineData, DrumPattern, DrumTrack } from '@renderer/types/drumMachine'
import {
  DRUM_BEAT_UNITS,
  DRUM_BPM_MAX,
  DRUM_BPM_MIN,
  DRUM_DEFAULT_BLOCK_UNITS,
  DRUM_DEFAULT_BPM,
  DRUM_DEFAULT_HITS,
  DRUM_DEFAULT_SWING_UNIT,
  DRUM_DEFAULT_TOTAL_BEATS,
  DRUM_DEFAULT_TRACK_SOUNDS,
  DRUM_DEFAULT_TRACK_VOLUME,
  DRUM_DEFAULT_VOLUME,
  DRUM_SWING_MAX,
  DRUM_SWING_UNIT_OPTIONS,
  DRUM_TOTAL_BEATS_MAX,
  DRUM_TOTAL_BEATS_MIN,
  DRUM_TRACK_MAX,
  isDrumSoundKey
} from '@renderer/constant/drumMachine'

/** 最小块时值（一百二十八分），低于此的碎块丢弃 */
const MIN_BLOCK_UNITS = 2

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function newTrackId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function clampTotalUnits(units: number): number {
  const beats = Math.round(units / DRUM_BEAT_UNITS)
  return clamp(beats, DRUM_TOTAL_BEATS_MIN, DRUM_TOTAL_BEATS_MAX) * DRUM_BEAT_UNITS
}

/** 各块起点（Unit256） */
export function blockStarts(blocks: readonly DrumBlock[]): number[] {
  const starts: number[] = []
  let acc = 0
  for (const b of blocks) {
    starts.push(acc)
    acc += b.duration
  }
  return starts
}

/** 用空块补一段时值：按 unit 切片，末片取余数 */
function fillerBlocks(units: number, unit = DRUM_DEFAULT_BLOCK_UNITS): DrumBlock[] {
  const out: DrumBlock[] = []
  let rest = units
  while (rest >= MIN_BLOCK_UNITS) {
    const d = Math.min(unit, rest)
    out.push({ duration: d, active: false })
    rest -= d
  }
  return out
}

/** 裁剪 / 补齐到 total：超出部分截断，不足用十六分空块补 */
export function fitBlocks(blocks: readonly DrumBlock[], total: number): DrumBlock[] {
  const out: DrumBlock[] = []
  let acc = 0
  for (const b of blocks) {
    if (acc >= total) break
    const d = Math.min(Math.round(b.duration), total - acc)
    if (d < MIN_BLOCK_UNITS) continue
    out.push({ duration: d, active: Boolean(b.active) })
    acc += d
  }
  if (acc < total) out.push(...fillerBlocks(total - acc))
  return out
}

/**
 * 改单个块的时值：
 * 变长时吃掉后面的块（后续块尽量保持原时间位置），到末尾为止；
 * 变短时在其后插入同时值的空块补足。
 */
export function setBlockDuration(
  blocks: readonly DrumBlock[],
  index: number,
  next: number,
  total: number
): DrumBlock[] {
  const list = blocks.map((b) => ({ ...b }))
  const target = list[index]
  if (!target || next < MIN_BLOCK_UNITS) return list
  const old = target.duration
  if (next > old) {
    let need = next - old
    let gained = 0
    while (need > 0 && index + 1 < list.length) {
      const after = list[index + 1]!
      if (after.duration <= need) {
        need -= after.duration
        gained += after.duration
        list.splice(index + 1, 1)
      } else {
        after.duration -= need
        gained += need
        need = 0
      }
    }
    target.duration = old + gained
  } else if (next < old) {
    target.duration = next
    list.splice(index + 1, 0, ...fillerBlocks(old - next, next))
  }
  return fitBlocks(list, total)
}

/** 整轨改成统一网格：保留原击打位置（落到所在新格） */
export function regridBlocks(blocks: readonly DrumBlock[], unit: number, total: number): DrumBlock[] {
  const grid = fillerBlocks(total, unit)
  const starts = blockStarts(grid)
  const oldStarts = blockStarts(blocks)
  blocks.forEach((b, i) => {
    if (!b.active) return
    const at = oldStarts[i]!
    let hit = 0
    for (let j = 0; j < starts.length; j++) {
      if (starts[j]! <= at) hit = j
      else break
    }
    grid[hit]!.active = true
  })
  return grid
}

export function createTrack(sound: number, total: number, hits: readonly number[] = []): DrumTrack {
  const blocks = fillerBlocks(total)
  for (const i of hits) {
    if (blocks[i]) blocks[i]!.active = true
  }
  return {
    id: newTrackId(),
    sound: isDrumSoundKey(sound) ? sound : DRUM_DEFAULT_TRACK_SOUNDS[0]!,
    volume: DRUM_DEFAULT_TRACK_VOLUME,
    muted: false,
    solo: false,
    blocks
  }
}

export function createDefaultDrumMachineData(): DrumMachineData {
  const totalUnits = DRUM_DEFAULT_TOTAL_BEATS * DRUM_BEAT_UNITS
  return {
    version: 1,
    bpm: DRUM_DEFAULT_BPM,
    volume: DRUM_DEFAULT_VOLUME,
    swing: 0,
    swingUnit: DRUM_DEFAULT_SWING_UNIT,
    pattern: {
      totalUnits,
      tracks: DRUM_DEFAULT_TRACK_SOUNDS.map((sound) =>
        createTrack(sound, totalUnits, DRUM_DEFAULT_HITS[sound] ?? [])
      )
    }
  }
}

function normalizeTrack(raw: unknown, total: number): DrumTrack | null {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as Partial<DrumTrack>
  const sound = Number(t.sound)
  if (!isDrumSoundKey(sound)) return null
  const blocks = Array.isArray(t.blocks)
    ? t.blocks
        .filter((b): b is DrumBlock => Boolean(b) && typeof b === 'object')
        .map((b) => ({ duration: finiteOr(b.duration, DRUM_DEFAULT_BLOCK_UNITS), active: Boolean(b.active) }))
    : []
  return {
    id: typeof t.id === 'string' && t.id ? t.id : newTrackId(),
    sound,
    volume: clamp(finiteOr(t.volume, DRUM_DEFAULT_TRACK_VOLUME), 0, 1),
    muted: Boolean(t.muted),
    solo: Boolean(t.solo),
    blocks: fitBlocks(blocks, total)
  }
}

/** 容错解析（库里 JSON 字符串或对象）；非法字段回退默认值 */
export function normalizeDrumMachineData(raw: unknown): DrumMachineData {
  let src = raw
  if (typeof src === 'string') {
    try {
      src = JSON.parse(src)
    } catch {
      return createDefaultDrumMachineData()
    }
  }
  if (!src || typeof src !== 'object') return createDefaultDrumMachineData()
  const o = src as Partial<DrumMachineData>
  const pattern = (o.pattern ?? {}) as Partial<DrumPattern>
  const totalUnits = clampTotalUnits(
    finiteOr(pattern.totalUnits, DRUM_DEFAULT_TOTAL_BEATS * DRUM_BEAT_UNITS)
  )
  const tracks = (Array.isArray(pattern.tracks) ? pattern.tracks : [])
    .map((t) => normalizeTrack(t, totalUnits))
    .filter((t): t is DrumTrack => t != null)
    .slice(0, DRUM_TRACK_MAX)
  return {
    version: 1,
    bpm: clamp(Math.round(finiteOr(o.bpm, DRUM_DEFAULT_BPM)), DRUM_BPM_MIN, DRUM_BPM_MAX),
    volume: clamp(finiteOr(o.volume, DRUM_DEFAULT_VOLUME), 0, 1),
    swing: clamp(finiteOr(o.swing, 0), 0, DRUM_SWING_MAX),
    swingUnit: (DRUM_SWING_UNIT_OPTIONS as readonly number[]).includes(Number(o.swingUnit))
      ? (Number(o.swingUnit) as DrumMachineData['swingUnit'])
      : DRUM_DEFAULT_SWING_UNIT,
    pattern: { totalUnits, tracks }
  }
}

/** IPC 只能传纯对象：去掉 Vue Proxy */
export function toPlainDrumMachineData(data: DrumMachineData): DrumMachineData {
  return JSON.parse(JSON.stringify(data)) as DrumMachineData
}

/** 独奏优先：有任一独奏轨时只放独奏轨，否则放未静音轨 */
export function isTrackAudible(track: DrumTrack, tracks: readonly DrumTrack[]): boolean {
  const anySolo = tracks.some((t) => t.solo)
  return anySolo ? track.solo : !track.muted
}

/** 摇摆：起点落在反拍（start % (2 × unit) === unit）的块延后 swing × unit */
export function swingOffsetUnits(start: number, swing: number, unit: number): number {
  if (swing <= 0) return 0
  return start % (unit * 2) === unit ? swing * unit : 0
}
