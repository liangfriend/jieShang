import { BracketTypeEnum, MusicScore, MusicScoreTypeEnum } from 'deciphony-renderer'
import {
  createBracket,
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '../dr-extensions/dr-edit/score-builder'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createDoubleVoiceJianpuGrandStaff() {
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    linkedStaff: true,
    bracket: createBracket(BracketTypeEnum.Bracket, 0)
  })

  const upperStaff = createSingleStaff({ withDefaultMeasure: false })
  const lowerStaff = createSingleStaff({ withDefaultMeasure: false })

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    upperStaff.measures.push(createMeasure())
    lowerStaff.measures.push(createMeasure())
  }

  grandStaff.staves.push(upperStaff, lowerStaff)
  return grandStaff
}

export function buildDoubleVoiceJianpuScore(): MusicScore {
  const data = createMusicScore({
    height: 10000,
    width: 800,
    type: MusicScoreTypeEnum.NumberNotation
  })

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createDoubleVoiceJianpuGrandStaff())
  }

  return data
}

export default buildDoubleVoiceJianpuScore()
