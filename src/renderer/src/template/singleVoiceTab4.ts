import { type MusicScore } from '@deciphony/renderer'
import { buildFretboardTabScore } from './fretboardTabFactory'
import { FretboardScoreType } from '@renderer/constant/fretboardScoreType'

/** 尤克里里谱（Ukulele，4 弦 TAB）单声部空模版 */
export function buildSingleVoiceTab4Score(): MusicScore {
  return buildFretboardTabScore(FretboardScoreType.Ukulele)
}

export default buildSingleVoiceTab4Score()
