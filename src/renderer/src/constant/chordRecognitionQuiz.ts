import {
  ABSOLUTE_PITCH_FULL_MIDI_MAX,
  ABSOLUTE_PITCH_FULL_MIDI_MIN,
  ABSOLUTE_PITCH_RESULT_GREEN,
  ABSOLUTE_PITCH_STANDARD_MIDI_MAX,
  ABSOLUTE_PITCH_STANDARD_MIDI_MIN,
  ABSOLUTE_PITCH_TARGET_HIGHLIGHT,
  buildQuizOptions,
  midiToPitchClass,
  OCTAVE_NOTE_NAME_LABELS,
  type AbsolutePitchSoundRange,
  type OctavePianoKeyState,
  type PitchClass
} from '@renderer/constant/absolutePitchTest'

export type ChordQuality = 'major' | 'minor' | 'dom7' | 'maj7' | 'min7'

/** 默认启用：大三 + 小三 */
export const CHORD_DEFAULT_QUALITIES: readonly ChordQuality[] = ['major', 'minor']

export const CHORD_ALL_QUALITIES: readonly ChordQuality[] = [
  'major',
  'minor',
  'dom7',
  'maj7',
  'min7'
]

/** 相对根音的半音间隔 */
export const CHORD_INTERVALS: Record<ChordQuality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10]
}

export const CHORD_NOTE_DURATION_SEC = 1.1

export type ChordSpec = {
  id: string
  quality: ChordQuality
  root: PitchClass
  midis: number[]
}

export type ChordChoice = {
  id: string
  quality: ChordQuality
  root: PitchClass
}

function clampMidi(midi: number) {
  return Math.min(ABSOLUTE_PITCH_FULL_MIDI_MAX, Math.max(ABSOLUTE_PITCH_FULL_MIDI_MIN, midi))
}

export function chordSpecId(quality: ChordQuality, root: PitchClass) {
  return `${quality}-${root}`
}

export function buildChordMidis(
  root: PitchClass,
  quality: ChordQuality,
  soundRange: AbsolutePitchSoundRange
): number[] {
  const intervals = CHORD_INTERVALS[quality]
  const span = intervals[intervals.length - 1] ?? 0

  let rootMidi: number
  if (soundRange === 'standard') {
    const min = ABSOLUTE_PITCH_STANDARD_MIDI_MIN
    const max = Math.max(min, ABSOLUTE_PITCH_STANDARD_MIDI_MAX - span)
    const candidates: number[] = []
    for (let midi = min; midi <= max; midi++) {
      if (midiToPitchClass(midi) === root) candidates.push(midi)
    }
    rootMidi = candidates[Math.floor(Math.random() * Math.max(candidates.length, 1))] ?? 60 + root
  } else {
    const min = ABSOLUTE_PITCH_FULL_MIDI_MIN + 12
    const max = Math.max(min, ABSOLUTE_PITCH_FULL_MIDI_MAX - span - 12)
    const candidates: number[] = []
    for (let midi = min; midi <= max; midi++) {
      if (midiToPitchClass(midi) === root) candidates.push(midi)
    }
    rootMidi =
      candidates[Math.floor(Math.random() * Math.max(candidates.length, 1))] ??
      ABSOLUTE_PITCH_FULL_MIDI_MIN + 24 + root
  }

  return intervals.map((interval) => clampMidi(rootMidi + interval))
}

export function createChordSpec(
  quality: ChordQuality,
  root: PitchClass,
  soundRange: AbsolutePitchSoundRange
): ChordSpec {
  return {
    id: chordSpecId(quality, root),
    quality,
    root,
    midis: buildChordMidis(root, quality, soundRange)
  }
}

export function formatChordChoiceLabel(
  choice: ChordChoice,
  qualityLabel: (quality: ChordQuality) => string
): string {
  const rootName = OCTAVE_NOTE_NAME_LABELS[choice.root]!
  if (choice.quality === 'major') return `${rootName} ${qualityLabel('major')}`
  if (choice.quality === 'minor') return `${rootName}m`
  if (choice.quality === 'dom7') return `${rootName}7`
  if (choice.quality === 'maj7') return `${rootName}maj7`
  return `${rootName}m7`
}

export function pickRandomChordSpec(
  qualities: readonly ChordQuality[],
  soundRange: AbsolutePitchSoundRange,
  avoidId?: string
): ChordSpec {
  const enabled = qualities.length ? qualities : CHORD_DEFAULT_QUALITIES
  const pool: ChordSpec[] = []
  for (const quality of enabled) {
    for (let root = 0; root < 12; root++) {
      pool.push(createChordSpec(quality, root as PitchClass, soundRange))
    }
  }
  const filtered = avoidId ? pool.filter((item) => item.id !== avoidId) : pool
  const source = filtered.length ? filtered : pool
  return source[Math.floor(Math.random() * source.length)]!
}

export function buildChordChoices(
  correct: ChordSpec,
  qualities: readonly ChordQuality[]
): ChordChoice[] {
  const enabled = qualities.length ? qualities : CHORD_DEFAULT_QUALITIES
  const pool: ChordChoice[] = []
  for (const quality of enabled) {
    for (let root = 0; root < 12; root++) {
      const item: ChordChoice = {
        id: chordSpecId(quality, root as PitchClass),
        quality,
        root: root as PitchClass
      }
      pool.push(item)
    }
  }
  const correctChoice: ChordChoice = {
    id: correct.id,
    quality: correct.quality,
    root: correct.root
  }
  return buildQuizOptions(correctChoice, pool, 4, (a, b) => a.id === b.id)
}

export function buildChordQuestionKeyStates(midis: readonly number[]): OctavePianoKeyState[] {
  const seen = new Set<number>()
  const states: OctavePianoKeyState[] = []
  for (const midi of midis) {
    const num = midiToPitchClass(midi)
    if (seen.has(num)) continue
    seen.add(num)
    states.push({
      num,
      border: ABSOLUTE_PITCH_TARGET_HIGHLIGHT,
      color: ABSOLUTE_PITCH_TARGET_HIGHLIGHT
    })
  }
  return states
}

export function buildChordResultKeyStates(midis: readonly number[]): OctavePianoKeyState[] {
  const seen = new Set<number>()
  const states: OctavePianoKeyState[] = []
  for (const midi of midis) {
    const num = midiToPitchClass(midi)
    if (seen.has(num)) continue
    seen.add(num)
    states.push({
      num,
      border: ABSOLUTE_PITCH_RESULT_GREEN,
      color: ABSOLUTE_PITCH_RESULT_GREEN
    })
  }
  return states
}
