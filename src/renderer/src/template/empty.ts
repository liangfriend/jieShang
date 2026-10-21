import {
  BarlineTypeEnum,
  BeamTypeEnum,
  BracketTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  MeasureEndRepeatEnum,
  MeasureStartRepeatEnum,
  MusicScore,
  TimeSignatureTypeEnum
} from '@deciphony/renderer'
import {
  createBarline,
  createClef,
  createGrandStaff,
  createKeySignature,
  createMusicScore,
  createNoteRest,
  createNotesInfo,
  createNoteSymbol,
  createSingleStaff,
  createTimeSignature
} from '@deciphony/extensions/dr-edit/score-builder'
// 曲谱结构

const data: MusicScore = createMusicScore({ height: 10000, width: 800 })
// 复谱表1-单谱表1
const grandStaff1 = createGrandStaff({ linkedStaff: true })

data.grandStaffs.push(grandStaff1)

// 第一小节默认不要前置小节线
const measure1 = data.grandStaffs[0].staves[0].measures[0]
delete measure1.barline_f

export default data
