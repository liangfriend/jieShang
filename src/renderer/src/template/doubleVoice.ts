import { BracketTypeEnum, ClefTypeEnum, MusicScore, TimeSignatureTypeEnum } from 'deciphony-renderer'
import {
  createBracket,
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '../dr-extensions/dr-edit/score-builder'

const GRAND_STAFF_COUNT = 4
const MEASURES_PER_STAFF = 4

function createDoubleVoiceGrandStaff() {
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    linkedStaff: true,
    bracket: createBracket(BracketTypeEnum.Bracket, 0)
  })

  const trebleStaff = createSingleStaff({ withDefaultMeasure: false })
  const bassStaff = createSingleStaff({ withDefaultMeasure: false })

  for (let i = 0; i < MEASURES_PER_STAFF; i++) {
    trebleStaff.measures.push(
      createMeasure(
        i === 0
          ? { clef: ClefTypeEnum.Treble, timeSignature: TimeSignatureTypeEnum['4_4'] }
          : {}
      )
    )
    bassStaff.measures.push(
      createMeasure(
        i === 0
          ? { clef: ClefTypeEnum.Bass, timeSignature: TimeSignatureTypeEnum['4_4'] }
          : {}
      )
    )
  }

  grandStaff.staves.push(trebleStaff, bassStaff)
  return grandStaff
}

export function buildDoubleVoiceScore(): MusicScore {
  const data = createMusicScore({ height: 10000, width: 800 })

  for (let i = 0; i < GRAND_STAFF_COUNT; i++) {
    data.grandStaffs.push(createDoubleVoiceGrandStaff())
  }

  return data
}

export default buildDoubleVoiceScore()
