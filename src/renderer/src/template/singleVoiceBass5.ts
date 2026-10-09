import { type MusicScore } from '@deciphony/renderer'
import { buildFretboardTabScore } from './fretboardTabFactory'
import { FretboardScoreType } from '@renderer/constant/fretboardScoreType'

/** 五弦贝斯谱（Bass5）单声部空模版 */
export function buildSingleVoiceBass5Score(): MusicScore {
  return buildFretboardTabScore(FretboardScoreType.Bass5)
}

export default buildSingleVoiceBass5Score()
