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
} from 'deciphony-renderer'
import {
  createBarline,
  createClef,
  createEmptyMeasure,
  createGrandStaff,
  createKeySignature,
  createMusicScore,
  createNoteRest,
  createNotesInfo,
  createNoteSymbol,
  createSingleStaff,
  createTimeSignature
} from '../dr-extensions/dr-edit/score-builder'
// 曲谱结构

const data: MusicScore = createMusicScore({ height: 10000, width: 800 })
// 复谱表1-单谱表1
const grandStaff1 = createGrandStaff()

data.grandStaffs.push(grandStaff1)

// 小节1-符号 高音谱号 F调 2/4拍
const measure1 = data.grandStaffs[0].staves[0].measures[0]

export default data
