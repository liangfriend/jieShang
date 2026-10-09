/** 节奏感测试：拍数选项 */
export const RHYTHM_SENSE_BEAT_OPTIONS = [4, 6, 8] as const

export type RhythmSenseBeatCount = (typeof RHYTHM_SENSE_BEAT_OPTIONS)[number]

export const RHYTHM_SENSE_DEFAULT_BEATS: RhythmSenseBeatCount = 4
export const RHYTHM_SENSE_DEFAULT_ROUNDS = 6
export const RHYTHM_SENSE_MIN_ROUNDS = 1
export const RHYTHM_SENSE_MAX_ROUNDS = 12

/** 每轮在 [min, max] 内按步长随机取 BPM（BPM 以四分音符计） */
export const RHYTHM_SENSE_BPM_LIMIT_MIN = 40
export const RHYTHM_SENSE_BPM_LIMIT_MAX = 240
export const RHYTHM_SENSE_BPM_STEP = 5
export const RHYTHM_SENSE_DEFAULT_BPM_RANGE: [number, number] = [80, 180]

/** 节拍单位：每次听拍 / 敲击对应的音符时值（1 全音符、2 二分、4 四分、8 八分） */
export const RHYTHM_SENSE_BEAT_UNIT_OPTIONS = [1, 2, 4, 8] as const

export type RhythmSenseBeatUnit = (typeof RHYTHM_SENSE_BEAT_UNIT_OPTIONS)[number]

export const RHYTHM_SENSE_DEFAULT_BEAT_UNIT: RhythmSenseBeatUnit = 4

/** 一拍（所选节拍单位）的毫秒数 */
export function rhythmBeatMs(bpm: number, beatUnit: RhythmSenseBeatUnit): number {
  return (60_000 / bpm) * (4 / beatUnit)
}

/** 开场倒计时数字（秒） */
export const RHYTHM_SENSE_COUNTDOWN_SECONDS = [3, 2, 1] as const
export const RHYTHM_SENSE_COUNTDOWN_STEP_MS = 1000

/** 单轮结果展示后进入下一轮的停顿 */
export const RHYTHM_SENSE_ROUND_PAUSE_MS = 2000

export type RhythmSensePhase = 'setup' | 'countdown' | 'listen' | 'tap' | 'roundResult' | 'final'

export type RhythmSenseRoundResult = {
  roundIndex: number
  bpm: number
  avgDeviationMs: number
  tapCount: number
}

/** 按相邻敲击间隔与目标拍长的绝对偏差求平均（ms） */
export function scoreRhythmTapIntervals(
  tapTimesMs: number[],
  bpm: number,
  beatUnit: RhythmSenseBeatUnit = RHYTHM_SENSE_DEFAULT_BEAT_UNIT
): number {
  if (tapTimesMs.length < 2 || bpm <= 0) return Number.POSITIVE_INFINITY
  const expected = rhythmBeatMs(bpm, beatUnit)
  let sum = 0
  for (let i = 1; i < tapTimesMs.length; i++) {
    sum += Math.abs(tapTimesMs[i]! - tapTimesMs[i - 1]! - expected)
  }
  return sum / (tapTimesMs.length - 1)
}

export function pickRandomRhythmBpm(
  range: readonly [number, number] = RHYTHM_SENSE_DEFAULT_BPM_RANGE
): number {
  const lo = Math.ceil(Math.min(range[0], range[1]) / RHYTHM_SENSE_BPM_STEP)
  const hi = Math.floor(Math.max(range[0], range[1]) / RHYTHM_SENSE_BPM_STEP)
  if (hi < lo) return Math.round(range[0])
  const step = lo + Math.floor(Math.random() * (hi - lo + 1))
  return step * RHYTHM_SENSE_BPM_STEP
}

export function findBestRhythmRound(
  rounds: readonly RhythmSenseRoundResult[]
): RhythmSenseRoundResult | null {
  if (!rounds.length) return null
  let best = rounds[0]!
  for (let i = 1; i < rounds.length; i++) {
    const item = rounds[i]!
    if (item.avgDeviationMs < best.avgDeviationMs) best = item
  }
  return best
}

export function averageRhythmDeviationMs(rounds: readonly RhythmSenseRoundResult[]): number {
  if (!rounds.length) return 0
  const sum = rounds.reduce((acc, item) => acc + item.avgDeviationMs, 0)
  return sum / rounds.length
}
