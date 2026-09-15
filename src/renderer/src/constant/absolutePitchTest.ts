/** 音级 0=C … 11=B */
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type AbsolutePitchScaleMode = 'pentatonic' | 'diatonic' | 'chromatic'
export type AbsolutePitchSoundRange = 'standard' | 'full'
export type OctavePianoLabelMode = 'noteName' | 'solfege' | 'number'

/** 琴键音名识别选项文本（含混合） */
export type KeyNoteOptionLabelMode = OctavePianoLabelMode | 'mixed'

export const KEY_NOTE_OPTION_LABEL_MODES: readonly KeyNoteOptionLabelMode[] = [
  'noteName',
  'solfege',
  'number',
  'mixed'
]

export const KEY_NOTE_DEFAULT_COUNTDOWN_SEC = 3

export type OctavePianoKeyState = {
  /** 0–11，对应八度内依次 12 个音 */
  num: number
  /** 文本颜色 */
  color?: string
  /** 边框颜色（白键默认白，黑键默认黑） */
  border?: string
}

/** 五音：宫商角徵羽 → C D E G A */
export const ABSOLUTE_PITCH_PENTATONIC: readonly PitchClass[] = [0, 2, 4, 7, 9]

/** 七音：C D E F G A B */
export const ABSOLUTE_PITCH_DIATONIC: readonly PitchClass[] = [0, 2, 4, 5, 7, 9, 11]

/** 十二音 */
export const ABSOLUTE_PITCH_CHROMATIC: readonly PitchClass[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
]

export const ABSOLUTE_PITCH_SCALE_OPTIONS: readonly AbsolutePitchScaleMode[] = [
  'pentatonic',
  'diatonic',
  'chromatic'
]

export const ABSOLUTE_PITCH_DEFAULT_ROUNDS = 6
export const ABSOLUTE_PITCH_MIN_ROUNDS = 1
export const ABSOLUTE_PITCH_MAX_ROUNDS = 12
export const ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC = 8
export const ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC = 3
export const ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC = 20
export const ABSOLUTE_PITCH_ROUND_PAUSE_MS = 2000
export const ABSOLUTE_PITCH_NOTE_DURATION_SEC = 0.9

/** 标准音：中央 C 所在八度 C4–B4 */
export const ABSOLUTE_PITCH_STANDARD_MIDI_MIN = 60
export const ABSOLUTE_PITCH_STANDARD_MIDI_MAX = 71

/** 全音：钢琴全音域 */
export const ABSOLUTE_PITCH_FULL_MIDI_MIN = 21
export const ABSOLUTE_PITCH_FULL_MIDI_MAX = 108

export const ABSOLUTE_PITCH_RESULT_GREEN = '#22c55e'
export const ABSOLUTE_PITCH_RESULT_RED = '#ef4444'
/** 答题中高亮目标键（非对错色） */
export const ABSOLUTE_PITCH_TARGET_HIGHLIGHT = '#6b8cff'

export const QUIZ_OPTION_COUNT = 4

export function shuffleInPlace<T>(list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = list[i]!
    list[i] = list[j]!
    list[j] = tmp
  }
  return list
}

/** 从池中抽干扰项，拼成含正确答案的选项并打乱 */
export function buildQuizOptions<T>(
  correct: T,
  distractorPool: readonly T[],
  optionCount = QUIZ_OPTION_COUNT,
  isSame: (a: T, b: T) => boolean = (a, b) => a === b
): T[] {
  const uniquePool: T[] = []
  for (const item of distractorPool) {
    if (isSame(item, correct)) continue
    if (uniquePool.some((x) => isSame(x, item))) continue
    uniquePool.push(item)
  }
  shuffleInPlace(uniquePool)
  const need = Math.max(0, optionCount - 1)
  const picked = uniquePool.slice(0, need)
  return shuffleInPlace([correct, ...picked])
}

export function pickRandomPitchClass(
  pool: readonly PitchClass[],
  avoid?: PitchClass
): PitchClass {
  if (!pool.length) return 0
  if (pool.length === 1) return pool[0]!
  const filtered = avoid == null ? pool : pool.filter((item) => item !== avoid)
  const source = filtered.length ? filtered : pool
  return source[Math.floor(Math.random() * source.length)]!
}

export const OCTAVE_WHITE_KEYS: readonly PitchClass[] = [0, 2, 4, 5, 7, 9, 11]
export const OCTAVE_BLACK_KEYS: readonly PitchClass[] = [1, 3, 6, 8, 10]

/** 黑键落在「左侧白键」索引之后（白键序列内） */
export const OCTAVE_BLACK_AFTER_WHITE_INDEX: Record<number, number> = {
  1: 0,
  3: 1,
  6: 3,
  8: 4,
  10: 5
}

export const OCTAVE_NOTE_NAME_LABELS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B'
] as const

export const OCTAVE_SOLFEGE_LABELS = [
  'do',
  'di',
  're',
  'ri',
  'mi',
  'fa',
  'fi',
  'sol',
  'si',
  'la',
  'li',
  'ti'
] as const

export const OCTAVE_NUMBER_LABELS = [
  '1',
  '#1',
  '2',
  '#2',
  '3',
  '4',
  '#4',
  '5',
  '#5',
  '6',
  '#6',
  '7'
] as const

export function resolveAbsolutePitchClasses(mode: AbsolutePitchScaleMode): readonly PitchClass[] {
  if (mode === 'pentatonic') return ABSOLUTE_PITCH_PENTATONIC
  if (mode === 'diatonic') return ABSOLUTE_PITCH_DIATONIC
  return ABSOLUTE_PITCH_CHROMATIC
}

export function midiToPitchClass(midi: number): PitchClass {
  return (((midi % 12) + 12) % 12) as PitchClass
}

export function collectMidiCandidates(
  soundRange: AbsolutePitchSoundRange,
  pitchClasses: readonly PitchClass[]
): number[] {
  const min =
    soundRange === 'standard' ? ABSOLUTE_PITCH_STANDARD_MIDI_MIN : ABSOLUTE_PITCH_FULL_MIDI_MIN
  const max =
    soundRange === 'standard' ? ABSOLUTE_PITCH_STANDARD_MIDI_MAX : ABSOLUTE_PITCH_FULL_MIDI_MAX
  const allow = new Set<number>(pitchClasses)
  const out: number[] = []
  for (let midi = min; midi <= max; midi++) {
    if (allow.has(midiToPitchClass(midi))) out.push(midi)
  }
  return out
}

export function pickRandomMidi(candidates: readonly number[], avoidMidi?: number): number {
  if (!candidates.length) return ABSOLUTE_PITCH_STANDARD_MIDI_MIN
  if (candidates.length === 1) return candidates[0]!
  const pool =
    avoidMidi == null ? candidates : candidates.filter((midi) => midi !== avoidMidi)
  const source = pool.length ? pool : candidates
  return source[Math.floor(Math.random() * source.length)]!
}

export function octaveKeyLabel(num: number, mode: OctavePianoLabelMode): string {
  const index = ((num % 12) + 12) % 12
  if (mode === 'solfege') return OCTAVE_SOLFEGE_LABELS[index]!
  if (mode === 'number') return OCTAVE_NUMBER_LABELS[index]!
  return OCTAVE_NOTE_NAME_LABELS[index]!
}

const BASIC_LABEL_MODES: readonly OctavePianoLabelMode[] = ['noteName', 'solfege', 'number']

export function resolveKeyNoteChoiceLabel(
  pitchClass: PitchClass,
  mode: KeyNoteOptionLabelMode
): string {
  if (mode !== 'mixed') return octaveKeyLabel(pitchClass, mode)
  const picked = BASIC_LABEL_MODES[Math.floor(Math.random() * BASIC_LABEL_MODES.length)]!
  return octaveKeyLabel(pitchClass, picked)
}

export type AbsolutePitchRoundResult = {
  roundIndex: number
  targetMidi: number
  targetPitchClass: PitchClass
  selectedPitchClass: PitchClass | null
  correct: boolean
  timedOut: boolean
  responseMs: number | null
}

export type AbilityQuizScoreRound = {
  correct: boolean
  timedOut: boolean
  responseMs: number | null
}

export function summarizeAbsolutePitchResults(rounds: readonly AbilityQuizScoreRound[]) {
  const total = rounds.length
  const correctCount = rounds.filter((item) => item.correct).length
  const wrongCount = rounds.filter((item) => !item.correct && !item.timedOut).length
  const timeoutCount = rounds.filter((item) => item.timedOut).length
  const timedResponses = rounds
    .map((item) => item.responseMs)
    .filter((ms): ms is number => ms != null && Number.isFinite(ms))
  const avgResponseMs = timedResponses.length
    ? timedResponses.reduce((sum, ms) => sum + ms, 0) / timedResponses.length
    : null

  let bestStreak = 0
  let streak = 0
  for (const item of rounds) {
    if (item.correct) {
      streak += 1
      bestStreak = Math.max(bestStreak, streak)
    } else {
      streak = 0
    }
  }

  return {
    total,
    correctCount,
    wrongCount,
    timeoutCount,
    accuracyPercent: total ? (correctCount / total) * 100 : 0,
    avgResponseMs,
    bestStreak
  }
}
