/**
 * 极限模式曲线衰减系数（等比级数渐近，非直线）。
 *
 * 令 n = t / 60（t 为开局后秒数）。难度累积进度：
 *   p(n) = 1/2 + 1/4 + … + 1/2^n = 1 - (1/2)^n
 *
 * 参数乘子取「剩余比例」：
 *   f(t) = (1/2)^n = 2^(-t/60)
 *
 * - f(0) = 1
 * - f(60) = 0.5
 * - f(120) = 0.25
 * - t→∞ 时趋近 0，且越往后单位时间内衰减越小
 */
export const NOTE_SLICE_EXTREME_DECAY_SCALE_SECONDS = 60

export function resolveNoteSliceExtremeDecay(passTimeMs: number): number {
  const seconds = Math.max(0, passTimeMs) / 1000
  const n = seconds / NOTE_SLICE_EXTREME_DECAY_SCALE_SECONDS
  return Math.pow(0.5, n)
}

/** 与 f(t) 互补的难度累积进度：1 - f(t) = 1 - (1/2)^n */
export function resolveNoteSliceExtremeDifficultyProgress(passTimeMs: number): number {
  return 1 - resolveNoteSliceExtremeDecay(passTimeMs)
}

/** @deprecated 使用 resolveNoteSliceExtremeDecay */
export const resolveNoteSliceExtremeLinearDecay = resolveNoteSliceExtremeDecay
