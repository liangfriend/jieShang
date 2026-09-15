/** 谱音同步：写入 MeasureNoteSlot.data 的时间属性名 */
export const SCORE_TIME_OFFSET_PROP = {
  vocalPerformance: 'vocalPerformance',
  accompaniment: 'accompaniment'
} as const

export type ScoreTimeOffsetProp =
  (typeof SCORE_TIME_OFFSET_PROP)[keyof typeof SCORE_TIME_OFFSET_PROP]

export const SCORE_TIME_OFFSET_PROP_OPTIONS: Array<{
  value: ScoreTimeOffsetProp
  labelKey: 'editor.timeOffset.vocalPerformance' | 'editor.timeOffset.accompaniment'
}> = [
  {
    value: SCORE_TIME_OFFSET_PROP.vocalPerformance,
    labelKey: 'editor.timeOffset.vocalPerformance'
  },
  {
    value: SCORE_TIME_OFFSET_PROP.accompaniment,
    labelKey: 'editor.timeOffset.accompaniment'
  }
]
