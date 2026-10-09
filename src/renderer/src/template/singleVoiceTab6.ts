import { MusicScoreTypeEnum, type MusicScore } from '@deciphony/renderer'
import { buildFretboardTabScore } from './fretboardTabFactory'
import { FretboardScoreType } from '@renderer/constant/fretboardScoreType'

/** 吉他谱（Guitar，6 弦 TAB）单声部空模版 */
export function buildSingleVoiceTab6Score(): MusicScore {
  return buildFretboardTabScore(FretboardScoreType.Guitar)
}

export default buildSingleVoiceTab6Score()
