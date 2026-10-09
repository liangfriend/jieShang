/** 演唱开始倒计时：3 → 2 → 1，每步 1 秒 */
export const SINGING_COUNTDOWN_STEPS = ['3', '2', '1'] as const
export const SINGING_COUNTDOWN_STEP_MS = 1000
export const SINGING_COUNTDOWN_MS =
  SINGING_COUNTDOWN_STEPS.length * SINGING_COUNTDOWN_STEP_MS
