import type { MusicScore } from '@deciphony/renderer'
import { KeySignatureTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import {
  numberNotationToStandardStaff,
  resolveScoreKeySignature,
  shiftMusicScoreBySemitones,
  standardStaffToNumberNotation,
  transposeMusicScore,
  type ShiftSemitoneOptions,
  type TransposeOptions
} from '@deciphony/extensions/dr-numberNotation-transfer'
import { isSupportedScoreNotationType } from '@renderer/constant/scoreNotationType'
import { isFretboardScoreType } from '@renderer/constant/fretboardScoreType'

export { resolveScoreKeySignature }

export const SCORE_KEY_SIGNATURE_OPTIONS: KeySignatureTypeEnum[] = Object.values(
  KeySignatureTypeEnum
)

/**
 * 简线切换：默认按 C 调重写目标谱（线谱 D → 简谱 C 首调等）。
 * 可通过 options.keySignature 指定目标调。
 */
export function convertScoreNotationType(
  score: MusicScore,
  targetType: MusicScoreTypeEnum,
  options?: { keySignature?: KeySignatureTypeEnum }
): MusicScore {
  if (score.type === targetType) {
    return JSON.parse(JSON.stringify(score)) as MusicScore
  }

  if (!isSupportedScoreNotationType(targetType)) {
    throw new Error('暂不支持该曲谱类型')
  }

  if (isFretboardScoreType(score.type)) {
    throw new Error('吉他谱 / 尤克里里谱 / 贝斯谱本期不支持转换为其它谱种')
  }

  if (score.type === MusicScoreTypeEnum.DrumNotation) {
    throw new Error('鼓谱本期不支持转换为其它谱种')
  }

  const keySignature = options?.keySignature ?? KeySignatureTypeEnum.C

  if (
    score.type === MusicScoreTypeEnum.StandardStaff &&
    targetType === MusicScoreTypeEnum.NumberNotation
  ) {
    return standardStaffToNumberNotation(score, { keySignature })
  }

  if (
    score.type === MusicScoreTypeEnum.NumberNotation &&
    targetType === MusicScoreTypeEnum.StandardStaff
  ) {
    return numberNotationToStandardStaff(score, { keySignature })
  }

  throw new Error('当前曲谱类型暂不支持转换为所选类型')
}

/** 同谱种转调：保持 concert 音高，按 fromKey 解释、按 toKey 重写。 */
export function transposeScoreNotation(
  score: MusicScore,
  options: Pick<TransposeOptions, 'toKey'> & Partial<Pick<TransposeOptions, 'fromKey' | 'priority'>>
): MusicScore {
  const fromKey = options.fromKey ?? resolveScoreKeySignature(score)
  return transposeMusicScore(score, {
    fromKey,
    toKey: options.toKey,
    priority: options.priority
  })
}

/** 升降调：全体音符按半音平移，调号不变。0 不变，正升负降。 */
export function shiftScoreBySemitones(
  score: MusicScore,
  semitones: number,
  options?: ShiftSemitoneOptions
): MusicScore {
  return shiftMusicScoreBySemitones(score, semitones, options)
}
