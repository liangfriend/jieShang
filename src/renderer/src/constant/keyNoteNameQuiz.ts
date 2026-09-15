import {
  ABSOLUTE_PITCH_CHROMATIC,
  ABSOLUTE_PITCH_RESULT_GREEN,
  ABSOLUTE_PITCH_RESULT_RED,
  ABSOLUTE_PITCH_TARGET_HIGHLIGHT,
  buildQuizOptions,
  pickRandomPitchClass,
  resolveAbsolutePitchClasses,
  resolveKeyNoteChoiceLabel,
  type AbsolutePitchScaleMode,
  type KeyNoteOptionLabelMode,
  type OctavePianoKeyState,
  type PitchClass
} from '@renderer/constant/absolutePitchTest'

export type KeyNoteChoice = {
  pitchClass: PitchClass
  label: string
}

export function buildKeyNoteChoices(
  target: PitchClass,
  scaleMode: AbsolutePitchScaleMode,
  labelMode: KeyNoteOptionLabelMode
): KeyNoteChoice[] {
  const primary = resolveAbsolutePitchClasses(scaleMode)
  const pool = [...primary, ...ABSOLUTE_PITCH_CHROMATIC]
  const options = buildQuizOptions(target, pool)
  return options.map((pitchClass) => ({
    pitchClass,
    label: resolveKeyNoteChoiceLabel(pitchClass, labelMode)
  }))
}

export function buildKeyNoteQuestionKeyStates(target: PitchClass): OctavePianoKeyState[] {
  return [
    {
      num: target,
      border: ABSOLUTE_PITCH_TARGET_HIGHLIGHT,
      color: ABSOLUTE_PITCH_TARGET_HIGHLIGHT
    }
  ]
}

export function buildKeyNoteResultKeyStates(
  target: PitchClass,
  selected: PitchClass | null
): OctavePianoKeyState[] {
  const states: OctavePianoKeyState[] = [
    {
      num: target,
      border: ABSOLUTE_PITCH_RESULT_GREEN,
      color: ABSOLUTE_PITCH_RESULT_GREEN
    }
  ]
  if (selected != null && selected !== target) {
    states.push({
      num: selected,
      border: ABSOLUTE_PITCH_RESULT_RED,
      color: ABSOLUTE_PITCH_RESULT_RED
    })
  }
  return states
}

export function nextKeyNoteTarget(
  scaleMode: AbsolutePitchScaleMode,
  avoid?: PitchClass
): PitchClass {
  return pickRandomPitchClass(resolveAbsolutePitchClasses(scaleMode), avoid)
}
