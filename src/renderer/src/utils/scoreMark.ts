import type { DrExtension, MusicScore } from '@deciphony/renderer'
import {
  drMark,
  FLUTE_KEYS,
  XIAO_KEYS,
  type FluteKey,
  type XiaoKey
} from '@deciphony/extensions/dr-mark'

/** 播放页标记：none / 八孔箫 `xiao:<key>` / 六孔笛 `flute:<key>` */
export type ScoreMarkValue = 'none' | `xiao:${XiaoKey}` | `flute:${FluteKey}`

export const SCORE_MARK_NONE: ScoreMarkValue = 'none'

export const SCORE_MARK_XIAO_KEYS: readonly XiaoKey[] = XIAO_KEYS
export const SCORE_MARK_FLUTE_KEYS: readonly FluteKey[] = FLUTE_KEYS

/** 调名显示：bB → ♭B；笛子 G = 大G、highG = 小G 由 i18n 处理 */
export function formatMarkKey(key: string): string {
  return key.replace(/^b/, '♭')
}

export function createScoreMarkExtension(value: ScoreMarkValue): DrExtension | null {
  if (value === SCORE_MARK_NONE) return null
  const [type, key] = value.split(':')
  if (type === 'xiao') return drMark({ type: 'xiao', xiao: { model: 'hole8', key: key as XiaoKey } })
  if (type === 'flute') return drMark({ type: 'flute', flute: { key: key as FluteKey } })
  return null
}

/** m-d 按单谱表逐行叠加，曲谱 height 固定，需按单谱表总数补高 */
export function scoreMarkExtraHeight(score: MusicScore, extension: DrExtension | null): number {
  const mdH = extension?.slotConfig?.['m-d']?.h ?? 0
  if (!mdH) return 0
  const staves = score.grandStaffs.reduce((sum, gs) => sum + gs.staves.length, 0)
  return mdH * staves
}
