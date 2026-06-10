import type { MusicScore } from 'deciphony-renderer'
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import {
  numberNotationToStandardStaff,
  standardStaffToNumberNotation
} from '@renderer/dr-extensions/dr-numberNotation-transfer'
import { isSupportedScoreNotationType } from '@renderer/constant/scoreNotationType'

export function convertScoreNotationType(
  score: MusicScore,
  targetType: MusicScoreTypeEnum
): MusicScore {
  if (score.type === targetType) {
    return JSON.parse(JSON.stringify(score)) as MusicScore
  }

  if (!isSupportedScoreNotationType(targetType)) {
    throw new Error('暂不支持该曲谱类型')
  }

  if (
    score.type === MusicScoreTypeEnum.StandardStaff &&
    targetType === MusicScoreTypeEnum.NumberNotation
  ) {
    return standardStaffToNumberNotation(score)
  }

  if (
    score.type === MusicScoreTypeEnum.NumberNotation &&
    targetType === MusicScoreTypeEnum.StandardStaff
  ) {
    return numberNotationToStandardStaff(score)
  }

  throw new Error('当前曲谱类型暂不支持转换为所选类型')
}
