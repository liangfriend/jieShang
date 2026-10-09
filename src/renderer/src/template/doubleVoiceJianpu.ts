import { BracketTypeEnum, type MusicScore } from '@deciphony/renderer'
import {
  createBracket,
  createGrandStaff
} from '@deciphony/extensions/dr-edit/score-builder'
import {
  createJianpuMeasure,
  createJianpuMusicScore,
  createJianpuSingleStaff
} from './jianpuFactory'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createDoubleVoiceJianpuGrandStaff() {
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    linkedStaff: true,
    bracket: createBracket(BracketTypeEnum.Bracket, 0)
  })

  const upperStaff = createJianpuSingleStaff()
  const lowerStaff = createJianpuSingleStaff()

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    upperStaff.measures.push(createJianpuMeasure())
    lowerStaff.measures.push(createJianpuMeasure())
  }

  grandStaff.staves.push(upperStaff, lowerStaff)
  return grandStaff
}

export function buildDoubleVoiceJianpuScore(): MusicScore {
  const data = createJianpuMusicScore()

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createDoubleVoiceJianpuGrandStaff())
  }

  return data
}

export default buildDoubleVoiceJianpuScore
