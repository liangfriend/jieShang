import { type MusicScore } from '@deciphony/renderer'
import { buildFretboardTabScore } from './fretboardTabFactory'
import { FretboardScoreType } from '@renderer/constant/fretboardScoreType'

/** 四弦贝斯谱（Bass4）单声部空模版 */
export function buildSingleVoiceBass4Score(): MusicScore {
  return buildFretboardTabScore(FretboardScoreType.Bass4)
}

export default buildSingleVoiceBass4Score()
