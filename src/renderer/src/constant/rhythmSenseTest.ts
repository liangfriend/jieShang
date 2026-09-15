/** 节奏感测试：拍数选项 */
export const RHYTHM_SENSE_BEAT_OPTIONS = [4, 6, 8] as const

export type RhythmSenseBeatCount = (typeof RHYTHM_SENSE_BEAT_OPTIONS)[number]

export const RHYTHM_SENSE_DEFAULT_BEATS: RhythmSenseBeatCount = 4
export const RHYTHM_SENSE_DEFAULT_ROUNDS = 6
export const RHYTHM_SENSE_MIN_ROUNDS = 1
export const RHYTHM_SENSE_MAX_ROUNDS = 12

/** 每轮随机 BPM 池 */
export const RHYTHM_SENSE_BPM_POOL = [80, 100, 120, 140, 160, 180] as const

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
export function scoreRhythmTapIntervals(tapTimesMs: number[], bpm: number): number {
  if (tapTimesMs.length < 2 || bpm <= 0) return Number.POSITIVE_INFINITY
  const expected = 60_000 / bpm
  let sum = 0
  for (let i = 1; i < tapTimesMs.length; i++) {
    sum += Math.abs(tapTimesMs[i]! - tapTimesMs[i - 1]! - expected)
  }
  return sum / (tapTimesMs.length - 1)
}

export function pickRandomRhythmBpm(pool: readonly number[] = RHYTHM_SENSE_BPM_POOL): number {
  const index = Math.floor(Math.random() * pool.length)
  return pool[index] ?? pool[0]!
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
