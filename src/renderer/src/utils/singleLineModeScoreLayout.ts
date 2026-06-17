import type { MusicScore } from 'deciphony-renderer'

/** 单行模式（练习/新手）下按单谱表行数对应的曲谱高度 */
export function resolveSingleLineModeScoreHeight(staffCount: number): number {
  if (staffCount <= 1) return 140
  if (staffCount === 2) return 260
  if (staffCount === 3) return 380
  return 500
}

export function countSingleStaffRows(score: MusicScore): number {
  let max = 0
  for (const grandStaff of score.grandStaffs ?? []) {
    max = Math.max(max, grandStaff.staves?.length ?? 0)
  }
  return Math.max(1, max)
}

export function applySingleLineModeScoreHeight(score: MusicScore): number {
  const height = resolveSingleLineModeScoreHeight(countSingleStaffRows(score))
  score.height = height
  return height
}
