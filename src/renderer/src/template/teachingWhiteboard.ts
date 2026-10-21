import { BracketTypeEnum, ClefTypeEnum, MusicScore } from '@deciphony/renderer'
import type { SingleStaff } from '@deciphony/renderer'
import {
  createBracket,
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '@deciphony/extensions/dr-edit/score-builder'
import type { WhiteboardStaffMode } from '@renderer/constant/whiteboard'

type StaffSpacing = Partial<Pick<SingleStaff, 'uSpaceI' | 'dSpaceI' | 'uSpaceO' | 'dSpaceO'>>

function createWhiteboardStaff(clef: ClefTypeEnum, spacing: StaffSpacing) {
  const staff = createSingleStaff({ withDefaultMeasure: false, ...spacing })
  const measure = createMeasure({ clef })
  delete measure.barline_f
  staff.measures.push(measure)
  return staff
}

/**
 * 双行模式两行之间只留两个间加一条加线（中央 C）的高度：
 * 交界处外边距归零，内边距相加为 21
 */
const DOUBLE_STAFF_GAP = { trebleDSpaceI: 10, bassUSpaceI: 11 } as const

function createWhiteboardStaves(mode: WhiteboardStaffMode): SingleStaff[] {
  if (mode === 'double') {
    return [
      createWhiteboardStaff(ClefTypeEnum.Treble, {
        dSpaceI: DOUBLE_STAFF_GAP.trebleDSpaceI,
        dSpaceO: 0
      }),
      createWhiteboardStaff(ClefTypeEnum.Bass, {
        uSpaceO: 0,
        uSpaceI: DOUBLE_STAFF_GAP.bassUSpaceI
      })
    ]
  }
  return [
    createWhiteboardStaff(ClefTypeEnum.Treble, { dSpaceI: 20 }),
    createWhiteboardStaff(ClefTypeEnum.Alto, { uSpaceI: 20, dSpaceI: 20 }),
    createWhiteboardStaff(ClefTypeEnum.Bass, { uSpaceI: 20 })
  ]
}

function createWhiteboardGrandStaff(mode: WhiteboardStaffMode) {
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    linkedStaff: true,
    bracket: createBracket(BracketTypeEnum.Bracket, 0)
  })
  grandStaff.staves.push(...createWhiteboardStaves(mode))
  return grandStaff
}

export function buildTeachingWhiteboardScore(mode: WhiteboardStaffMode): MusicScore {
  const data = createMusicScore({ height: 250, width: 1000 })
  data.grandStaffs.push(createWhiteboardGrandStaff(mode))
  return data
}
