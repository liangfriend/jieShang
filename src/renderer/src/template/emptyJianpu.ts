import { MusicScore, MusicScoreTypeEnum } from 'deciphony-renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff
} from '../dr-extensions/dr-edit/score-builder'

const data: MusicScore = createMusicScore({
  height: 10000,
  width: 800,
  type: MusicScoreTypeEnum.NumberNotation
})

const grandStaff1 = createGrandStaff({ withDefaultStaff: false })
const singleStaff = createSingleStaff({ withDefaultMeasure: false })
singleStaff.measures.push(createMeasure())
grandStaff1.staves.push(singleStaff)
data.grandStaffs.push(grandStaff1)

export default data
