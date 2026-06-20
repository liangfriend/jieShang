import { MusicScoreTypeEnum } from 'deciphony-renderer'

import { resolveNotationTypeLabel } from '@renderer/i18n/helpers'

/** 曲谱记谱类型选项（后续可扩展吉他谱、尤克里里谱等） */
export type ScoreNotationTypeOption = {
  value: MusicScoreTypeEnum
}

export const SCORE_NOTATION_TYPE_OPTIONS: ScoreNotationTypeOption[] = [
  { value: MusicScoreTypeEnum.StandardStaff },
  { value: MusicScoreTypeEnum.NumberNotation }
]

export function resolveScoreNotationTypeLabel(type: MusicScoreTypeEnum): string {
  return resolveNotationTypeLabel(type)
}

export function isSupportedScoreNotationType(type: MusicScoreTypeEnum): boolean {
  return SCORE_NOTATION_TYPE_OPTIONS.some((item) => item.value === type)
}
