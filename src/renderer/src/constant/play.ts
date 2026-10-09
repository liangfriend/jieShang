/** NPlayer 音量范围（UI / store 与写入播放器的值一致；增益由 NPlayer 内置） */
export const PLAY_VOLUME_MIN = 0
export const PLAY_VOLUME_MAX = 1
export const PLAY_DEFAULT_VOLUME = 1

/** NPlayer BPM 可调范围 */
export const PLAY_BPM_MIN = 40
export const PLAY_BPM_MAX = 240
export const PLAY_DEFAULT_BPM = 120

/** 四分音符对应的 beatUnit（用户可见 BPM 的基准） */
export const PLAY_QUARTER_BEAT_UNIT = 4

/**
 * 曲谱序列播放默认包络（秒）。
 * A/D 压进每个音符 duration；R 在 duration 之后；末音 R 结束后才 onEnd。
 */
export const PLAY_SMOOTH_ENVELOPE = {
  attack: 0.05,
  decay: 0.1,
  peakVolume: 1.2,
  release: 0.2
} as const

export type ScoreTempoSource = {
  bpm?: number
  beatUnit?: number
}

function clampPlayBpm(value: number): number {
  return Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, value))
}

function normalizeBeatUnit(beatUnit?: number): number {
  if (typeof beatUnit === 'number' && Number.isFinite(beatUnit) && beatUnit > 0) {
    return beatUnit
  }
  return PLAY_QUARTER_BEAT_UNIT
}

/**
 * 播放默认 BPM：取曲谱顶层 bpm/beatUnit，换算为「四分音符 = N」的用户可见 BPM。
 * 缺省 bpm → 120；缺省 beatUnit → 4。
 * 例：beatUnit=8、bpm=120 → 返回 60。
 */
export function resolvePlayBpm(score?: ScoreTempoSource | number): number {
  let rawBpm: number | undefined
  let beatUnit = PLAY_QUARTER_BEAT_UNIT

  if (typeof score === 'number') {
    rawBpm = score
  } else if (score) {
    rawBpm = score.bpm
    beatUnit = normalizeBeatUnit(score.beatUnit)
  }

  const scoreBpm =
    typeof rawBpm === 'number' && Number.isFinite(rawBpm) && rawBpm > 0
      ? rawBpm
      : PLAY_DEFAULT_BPM

  return clampPlayBpm((scoreBpm * PLAY_QUARTER_BEAT_UNIT) / beatUnit)
}

/** 四分音符 BPM → 指定 beatUnit 下的 BPM（节拍器等） */
export function toBeatUnitBpm(quarterBpm: number, beatUnit: number): number {
  const bu = normalizeBeatUnit(beatUnit)
  return (quarterBpm * bu) / PLAY_QUARTER_BEAT_UNIT
}
