import { type MusicScore } from '@deciphony/renderer'
import { buildFretboardTabScore } from './fretboardTabFactory'
import { FretboardScoreType } from '@renderer/constant/fretboardScoreType'

/** 六弦贝斯谱（Bass6）单声部空模版 */
export function buildSingleVoiceBass6Score(): MusicScore {
  return buildFretboardTabScore(FretboardScoreType.Bass6)
}

export default buildSingleVoiceBass6Score()
