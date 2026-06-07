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

/** 音符评分结果对应的颜色 */
export const NOTE_RESULT_COLOR: Record<NoteScoreResult, string> = {
  perfect: '#2eb8a6',
  good: '#4dd4c4',
  pass: '#ffd166',
  early: '#ff9f43',
  late: '#ff6b9d',
  miss: '#c4c4c4'
}

export const NOTE_RESULT_LABEL: Record<NoteScoreResult, string> = {
  perfect: '完美',
  good: '优秀',
  pass: '及格',
  early: '弹早',
  late: '弹晚',
  miss: '漏弹'
}
