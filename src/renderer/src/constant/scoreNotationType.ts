import { MusicScoreTypeEnum } from 'deciphony-renderer'

/** 曲谱记谱类型选项（后续可扩展吉他谱、尤克里里谱等） */
export type ScoreNotationTypeOption = {
  value: MusicScoreTypeEnum
  label: string
}

export const SCORE_NOTATION_TYPE_OPTIONS: ScoreNotationTypeOption[] = [
  { value: MusicScoreTypeEnum.StandardStaff, label: '线谱' },
  { value: MusicScoreTypeEnum.NumberNotation, label: '简谱' }
]

export function resolveScoreNotationTypeLabel(type: MusicScoreTypeEnum): string {
  return SCORE_NOTATION_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? '未知'
}

export function isSupportedScoreNotationType(type: MusicScoreTypeEnum): boolean {
  return SCORE_NOTATION_TYPE_OPTIONS.some((item) => item.value === type)
}
