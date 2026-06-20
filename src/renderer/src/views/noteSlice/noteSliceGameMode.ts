/** 已实现的游戏模式 */
export type NoteSliceGameMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceGameEndReason = 'time_up' | 'no_lives'

import type { AchievementDefinition } from '@renderer/constant/achievements'

export type NoteSliceGameEndPayload = {
  score: number
  reason: NoteSliceGameEndReason
  /** 本局成绩是否严格超过入库前的历史最佳 */
  isNewPersonalBest: boolean
  /** 入库前的历史最佳（用于弹窗展示） */
  previousBest: number
  /** 本局新解锁的成就（已写入数据库） */
  newlyUnlockedAchievements: AchievementDefinition[]
}

/** 开局倒计时数字步（共 3 步，每步 1s；最终「开始」文案由 Vue i18n 提供） */
export const NOTE_SLICE_START_COUNTDOWN_NUMERIC_STEPS = ['3', '2', '1'] as const

/** @deprecated 使用 NOTE_SLICE_START_COUNTDOWN_NUMERIC_STEPS + noteSlice.countdown.start */
export const NOTE_SLICE_START_COUNTDOWN_LABELS = [
  ...NOTE_SLICE_START_COUNTDOWN_NUMERIC_STEPS,
  'start'
] as const

/** 开局倒计时单步时长（ms） */
export const NOTE_SLICE_START_COUNTDOWN_STEP_MS = 1000

/** 街机模式限时（秒） */
export const NOTE_SLICE_ARCADE_DURATION_SECONDS = 60

/** 街机模式切炸弹扣分 */
export const NOTE_SLICE_ARCADE_BOMB_PENALTY = 10

/** 无限 / 极限模式初始生命数 */
export const NOTE_SLICE_ENDLESS_LIVES = 3

export const NOTE_SLICE_EXTREME_LIVES = NOTE_SLICE_ENDLESS_LIVES

/** 将剩余毫秒格式化为 M:SS（向上取整到秒） */
export function formatNoteSliceArcadeTimeRemaining(timeRemainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(timeRemainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** 极限模式已过时间：秒.毫秒，如 127.251 表示 127 秒 251 毫秒 */
export function formatNoteSliceExtremeElapsed(passTimeMs: number): string {
  const totalMs = Math.max(0, Math.floor(passTimeMs))
  const seconds = Math.floor(totalMs / 1000)
  const ms = totalMs % 1000
  return `${seconds}.${ms.toString().padStart(3, '0')}`
}
