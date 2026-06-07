import { BracketTypeEnum, ClefTypeEnum, MusicScore } from 'deciphony-renderer'
import {
  createBracket,
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '../dr-extensions/dr-edit/score-builder'

function createWhiteboardStaff(clef: ClefTypeEnum, spacing: { uSpaceI?: number; dSpaceI?: number }) {
  const staff = createSingleStaff({ withDefaultMeasure: false, ...spacing })
  staff.measures.push(createMeasure({ clef }))
  return staff
}

function createWhiteboardGrandStaff() {
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    linkedStaff: true,
    bracket: createBracket(BracketTypeEnum.Bracket, 0)
  })

  grandStaff.staves.push(
    createWhiteboardStaff(ClefTypeEnum.Treble, { dSpaceI: 20 }),
    createWhiteboardStaff(ClefTypeEnum.Alto, { uSpaceI: 20, dSpaceI: 20 }),
    createWhiteboardStaff(ClefTypeEnum.Bass, { uSpaceI: 20 })
  )
  return grandStaff
}

export function buildTeachingWhiteboardScore(): MusicScore {
  const data = createMusicScore({ height: 250, width: 1000 })
  data.grandStaffs.push(createWhiteboardGrandStaff())
  return data
}

export default buildTeachingWhiteboardScore()
