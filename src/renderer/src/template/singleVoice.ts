import { ClefTypeEnum, MusicScore, TimeSignatureTypeEnum } from 'deciphony-renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '../dr-extensions/dr-edit/score-builder'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createSingleVoiceGrandStaff() {
  const grandStaff = createGrandStaff({ withDefaultStaff: false })
  const singleStaff = createSingleStaff({ withDefaultMeasure: false })

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    singleStaff.measures.push(
      createMeasure(
        i === 0
          ? { clef: ClefTypeEnum.Treble, timeSignature: TimeSignatureTypeEnum['4_4'] }
          : {}
      )
    )
  }

  grandStaff.staves.push(singleStaff)
  return grandStaff
}

export function buildSingleVoiceScore(): MusicScore {
  const data = createMusicScore({ height: 10000, width: 800 })

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createSingleVoiceGrandStaff())
  }

  return data
}

export default buildSingleVoiceScore()
