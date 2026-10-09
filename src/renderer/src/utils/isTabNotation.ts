import { MusicScoreTypeEnum } from '@deciphony/renderer'
import type { MusicScore } from '@deciphony/renderer'
import { isFretboardScoreType } from '@renderer/constant/fretboardScoreType'
import { isInstrumentLockedScoreType } from '@renderer/utils/instrumentScoreTone'

/** 指板类 TAB：吉他 / 尤克里里 / 贝斯 4·5·6 */
export function isTabNotationType(type: MusicScoreTypeEnum | undefined | null): boolean {
  return isFretboardScoreType(type)
}

export function isTabMusicScore(score: MusicScore | null | undefined): boolean {
  return isTabNotationType(score?.type)
}

/** 架子鼓谱 DrumNotation */
export function isDrumNotationType(type: MusicScoreTypeEnum | undefined | null): boolean {
  return type === MusicScoreTypeEnum.DrumNotation
}

export function isDrumMusicScore(score: MusicScore | null | undefined): boolean {
  return isDrumNotationType(score?.type)
}

/**
 * 乐器谱（吉他 / 尤克里里 / 贝斯 / 鼓）：
 * 播放音色由曲谱单谱表 instrumentValue（及泛音键）固定，不可在播放页切换。
 */
export function isFixedToneColorScore(score: MusicScore | null | undefined): boolean {
  return isInstrumentLockedScoreType(score?.type)
}

/**
 * 仅支持播放模式的谱种（吉他 / 尤克里里 / 贝斯 / 鼓谱）：
 * 不可进入练习、新手、演唱等单行模式。
 */
export function isPlayOnlyMusicScore(score: MusicScore | null | undefined): boolean {
  return isTabMusicScore(score) || isDrumMusicScore(score)
}
