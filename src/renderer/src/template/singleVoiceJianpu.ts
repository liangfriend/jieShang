import { MusicScore, MusicScoreTypeEnum } from 'deciphony-renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '../dr-extensions/dr-edit/score-builder'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createSingleVoiceJianpuGrandStaff() {
  const grandStaff = createGrandStaff({ withDefaultStaff: false })
  const singleStaff = createSingleStaff({ withDefaultMeasure: false })

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    singleStaff.measures.push(createMeasure())
  }

  grandStaff.staves.push(singleStaff)
  return grandStaff
}

export function buildSingleVoiceJianpuScore(): MusicScore {
  const data = createMusicScore({
    height: 10000,
    width: 800,
    type: MusicScoreTypeEnum.NumberNotation
  })

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createSingleVoiceJianpuGrandStaff())
  }

  return data
}

export default buildSingleVoiceJianpuScore()
