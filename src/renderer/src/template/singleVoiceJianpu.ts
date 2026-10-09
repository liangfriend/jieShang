import type { MusicScore } from '@deciphony/renderer'
import { createGrandStaff } from '@deciphony/extensions/dr-edit/score-builder'
import {
  createJianpuMeasure,
  createJianpuMusicScore,
  createJianpuSingleStaff
} from './jianpuFactory'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createSingleVoiceJianpuGrandStaff() {
  const grandStaff = createGrandStaff({ withDefaultStaff: false, linkedStaff: true })
  const singleStaff = createJianpuSingleStaff()

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    singleStaff.measures.push(createJianpuMeasure())
  }

  grandStaff.staves.push(singleStaff)
  return grandStaff
}

export function buildSingleVoiceJianpuScore(): MusicScore {
  const data = createJianpuMusicScore()

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createSingleVoiceJianpuGrandStaff())
  }

  return data
}

export default buildSingleVoiceJianpuScore
