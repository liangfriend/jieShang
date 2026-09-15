/** 播放模式音源：曲谱合成 / 范唱音频 / 伴奏音频 */
export const PLAY_SOURCE = {
  score: 'score',
  vocal: 'vocal',
  accompaniment: 'accompaniment'
} as const

export type PlaySource = (typeof PLAY_SOURCE)[keyof typeof PLAY_SOURCE]

export const PLAY_SOURCE_OPTIONS: Array<{
  value: PlaySource
  labelKey: 'play.toolbar.sourceScore' | 'play.toolbar.sourceVocal' | 'play.toolbar.sourceAccompaniment'
}> = [
  { value: PLAY_SOURCE.score, labelKey: 'play.toolbar.sourceScore' },
  { value: PLAY_SOURCE.vocal, labelKey: 'play.toolbar.sourceVocal' },
  { value: PLAY_SOURCE.accompaniment, labelKey: 'play.toolbar.sourceAccompaniment' }
]
