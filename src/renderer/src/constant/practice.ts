import type { HighlightPolicy, NoteScoreResult } from '@renderer/types/types'

export type PracticeDifficulty = 'beginner' | 'intermediate' | 'master'

/** 难度预设：新手 / 老手 / 大师，单位毫秒 */
export const DIFFICULTY_POLICY: Record<PracticeDifficulty, HighlightPolicy> = {
  beginner: {
    startTriggerThreshold: 260,
    postTriggerThreshold: 260,
    passThreshold: 200,
    goodThreshold: 140,
    perfectThresdhold: 90
  },
  intermediate: {
    startTriggerThreshold: 200,
    postTriggerThreshold: 200,
    passThreshold: 150,
    goodThreshold: 100,
    perfectThresdhold: 70
  },
  master: {
    startTriggerThreshold: 150,
    postTriggerThreshold: 150,
    passThreshold: 100,
    goodThreshold: 60,
    perfectThresdhold: 35
  }
}

export const DEFAULT_DIFFICULTY: PracticeDifficulty = 'beginner'

/** 音符评分结果对应的颜色（瀑布流/图例主色） */
export const NOTE_RESULT_COLOR: Record<NoteScoreResult, string> = {
  perfect: '#3399ff',
  good: '#15803d',
  pass: '#f97316',
  early: '#93c5fd',
  late: '#f9a8d4',
  miss: '#ef4444'
}

/** 设置附录图例色块（完美为彩虹渐变，红→橙→黄→绿→蓝） */
export const NOTE_RESULT_LEGEND_STYLE: Record<NoteScoreResult, string> = {
  perfect: 'linear-gradient(135deg, #ff3366, #ff9933, #ffdd00, #33cc66, #3399ff)',
  good: NOTE_RESULT_COLOR.good,
  pass: NOTE_RESULT_COLOR.pass,
  early: NOTE_RESULT_COLOR.early,
  late: NOTE_RESULT_COLOR.late,
  miss: NOTE_RESULT_COLOR.miss
}

export const NOTE_RESULT_LABEL: Record<NoteScoreResult, string> = {
  perfect: '完美',
  good: '优秀',
  pass: '及格',
  early: '弹早',
  late: '弹晚',
  miss: '漏弹'
}
