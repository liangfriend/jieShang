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

function createDrumGrandStaff() {
  const grandStaff = createGrandStaff({ withDefaultStaff: false, linkedStaff: true })
  const singleStaff = createSingleStaff({
    withDefaultMeasure: false,
    notationType: MusicScoreTypeEnum.DrumNotation
  })

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    // 每行第一小节默认带打击乐谱号 + 拍号；voices 双声部（符干上 / 下）；不要前置小节线
    const measure = createMeasure(
      i === 0
        ? {
            clef: ClefTypeEnum.Percussion,
            timeSignature: TimeSignatureTypeEnum['4_4'],
            voices: true
          }
        : { voices: true }
    )
    if (i === 0) delete measure.barline_f
    singleStaff.measures.push(measure)
  }

  grandStaff.staves.push(singleStaff)
  return grandStaff
}

/** 架子鼓谱（DrumNotation）空模版；单谱表带打击乐音色 */
export function buildSingleVoiceDrumScore(): MusicScore {
  const data = createMusicScore({
    height: 10000,
    width: 800,
    type: MusicScoreTypeEnum.DrumNotation
  })

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createDrumGrandStaff())
  }

  applyInstrumentScoreToneToScore(data)
  return data
}

export default buildSingleVoiceDrumScore()
