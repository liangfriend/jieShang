/** 瀑布流评分策略，单位均为毫秒 */
export interface HighlightPolicy {
  /** 能提前触发弹奏的时间，理论上应比 goodThreshold 大，否则触发不了弹早 */
  startTriggerThreshold: number
  /** 能延后触发弹奏的时间，理论上应比 goodThreshold 大，否则触发不了弹晚 */
  postTriggerThreshold: number
  /** 前后多少毫秒内触发不算弹早弹晚，算及格 */
  passThreshold: number
  /** 前后多少毫秒内触发算优秀 */
  goodThreshold: number
  /** 前后多少毫秒内触发算完美 */
  perfectThresdhold: number
}

/** 单个音符的评分结果 */
export type NoteScoreResult = 'perfect' | 'good' | 'pass' | 'early' | 'late' | 'miss'

/** 瀑布流实时详情信息 */
export interface WaterfallScoreStats {
  /** 音符总数 */
  total: number
  /** 漏弹数 */
  miss: number
  /** 弹早数 */
  early: number
  /** 弹晚数 */
  late: number
  /** 及格数 */
  pass: number
  /** 优秀数 */
  good: number
  /** 完美数 */
  perfect: number
  /** 已判定音符数 */
  judged: number
  /** 实时分 */
  realScore: number
  /** 总分 */
  totalScore: number
}
