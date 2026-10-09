import { TimeSignatureTypeEnum, timeSignatureTypeToBeats, type MusicScore } from '@deciphony/renderer'
import type { TimeSignature } from '@deciphony/player'

export type ResolvedScoreTimeSignature = {
  /** MPlayer 拍号，如 '6/8' */
  timeSignature: TimeSignature
  /** 几分音符为一拍（拍号分母）；6/8 → 8 */
  beatUnit: number
  /** 每小节拍数（拍号分子）；6/8 → 6 */
  beatsPerBar: number
}

/** TimeSignatureTypeEnum → MPlayer 拍号字符串与 beatUnit */
export function timeSignatureTypeToPlayer(
  type: TimeSignatureTypeEnum
): ResolvedScoreTimeSignature {
  const { beats, beatType } = timeSignatureTypeToBeats(type)
  const beatsPerBar = Number.isFinite(beats) && beats > 0 ? beats : 4
  const beatUnit = Number.isFinite(beatType) && beatType > 0 ? beatType : 4
  return {
    timeSignature: `${beatsPerBar}/${beatUnit}` as TimeSignature,
    beatUnit,
    beatsPerBar
  }
}

/**
 * 从曲谱解析拍号：优先顶层 timeSignature（简谱），否则扫描小节前置拍号。
 * Common→4/4，Cut→2/2；缺省 4/4。
 */
export function resolveScoreTimeSignature(score: MusicScore): ResolvedScoreTimeSignature {
  let raw: TimeSignatureTypeEnum | string | undefined = score.timeSignature

  if (!raw) {
    outer: for (const grandStaff of score.grandStaffs ?? []) {
      for (const staff of grandStaff.staves ?? []) {
        for (const measure of staff.measures ?? []) {
          const type = measure.timeSignature_f?.type
          if (type) {
            raw = type
            break outer
          }
        }
      }
    }
  }

  if (!raw) {
    return timeSignatureTypeToPlayer(TimeSignatureTypeEnum['4_4'])
  }
  return timeSignatureTypeToPlayer(raw as TimeSignatureTypeEnum)
}
