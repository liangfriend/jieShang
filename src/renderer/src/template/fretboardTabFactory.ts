import {
  ClefTypeEnum,
  MusicScoreTypeEnum,
  TimeSignatureTypeEnum,
  type MusicScore
} from '@deciphony/renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '@deciphony/extensions/dr-edit/score-builder'
import { applyInstrumentScoreToneToScore } from '@renderer/utils/instrumentScoreTone'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createFretboardGrandStaff(notationType: MusicScoreTypeEnum) {
  const grandStaff = createGrandStaff({ withDefaultStaff: false, linkedStaff: true })
  const singleStaff = createSingleStaff({
    withDefaultMeasure: false,
    notationType
  })

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    // 每行单谱表第一小节默认带 TAB 谱号 + 拍号；不要前置小节线
    const measure = createMeasure(
      i === 0
        ? { clef: ClefTypeEnum.Tab, timeSignature: TimeSignatureTypeEnum['4_4'] }
        : {}
    )
    if (i === 0) delete measure.barline_f
    singleStaff.measures.push(measure)
  }

  grandStaff.staves.push(singleStaff)
  return grandStaff
}

/** 指板类 TAB 空模版（吉他 / 尤克里里 / 贝斯）；单谱表带默认音色 */
export function buildFretboardTabScore(type: MusicScoreTypeEnum): MusicScore {
  const data = createMusicScore({
    height: 10000,
    width: 800,
    type
  })

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createFretboardGrandStaff(type))
  }

  applyInstrumentScoreToneToScore(data)
  return data
}
