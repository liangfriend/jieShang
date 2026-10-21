import { BracketTypeEnum, ClefTypeEnum, MusicScore, TimeSignatureTypeEnum } from '@deciphony/renderer'
import {
  createBracket,
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '@deciphony/extensions/dr-edit/score-builder'

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
    const treble = createMeasure(
      i === 0
        ? { clef: ClefTypeEnum.Treble, timeSignature: TimeSignatureTypeEnum['4_4'] }
        : {}
    )
    const bass = createMeasure(
      i === 0
        ? { clef: ClefTypeEnum.Bass, timeSignature: TimeSignatureTypeEnum['4_4'] }
        : {}
    )
    if (i === 0) {
      delete treble.barline_f
      delete bass.barline_f
    }
    trebleStaff.measures.push(treble)
    bassStaff.measures.push(bass)
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
