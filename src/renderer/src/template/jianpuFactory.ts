import {
  KeySignatureTypeEnum,
  MusicScoreTypeEnum,
  TimeSignatureTypeEnum,
  type Measure,
  type MusicScore,
  type SingleStaff
} from '@deciphony/renderer'
import {
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '@deciphony/extensions/dr-edit/score-builder'

/** 简谱曲谱：调号/拍号写在顶层，小节不带 key/time/clef */
export function createJianpuMusicScore(
  options: Parameters<typeof createMusicScore>[0] = {}
): MusicScore {
  const { type: _ignoredType, ...rest } = options ?? {}
  return createMusicScore({
    height: 10000,
    width: 800,
    keySignature: KeySignatureTypeEnum.C,
    timeSignature: TimeSignatureTypeEnum['4_4'],
    ...rest,
    type: MusicScoreTypeEnum.NumberNotation
  })
}

/** 简谱空小节：无谱号/调号/拍号（由曲谱顶层兜底）；不要前置小节线 */
export function createJianpuMeasure(): Measure {
  const measure = createMeasure()
  delete measure.clef_f
  delete measure.clef_b
  delete measure.keySignature_f
  delete measure.keySignature_b
  delete measure.timeSignature_f
  delete measure.timeSignature_b
  delete measure.barline_f
  return measure
}

export function createJianpuSingleStaff(options?: {
  withDefaultMeasure?: boolean
}): SingleStaff {
  const withDefaultMeasure = options?.withDefaultMeasure === true
  const staff = createSingleStaff({
    withDefaultMeasure: false,
    notationType: MusicScoreTypeEnum.NumberNotation
  })
  if (withDefaultMeasure) {
    staff.measures.push(createJianpuMeasure())
  }
  return staff
}
