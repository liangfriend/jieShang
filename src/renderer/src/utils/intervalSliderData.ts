export type IntervalSliderStepKey =
  | 'unison'
  | 'minorSecond'
  | 'majorSecond'
  | 'minorThird'
  | 'majorThird'
  | 'perfectFourth'
  | 'augmentedFourth'
  | 'perfectFifth'
  | 'minorSixth'
  | 'majorSixth'
  | 'minorSeventh'
  | 'majorSeventh'
  | 'octave'
  | 'minorNinth'
  | 'majorNinth'
  | 'minorTenth'
  | 'majorTenth'
  | 'perfectEleventh'
  | 'augmentedEleventh'
  | 'perfectTwelfth'
  | 'minorThirteenth'
  | 'majorThirteenth'
  | 'minorFourteenth'
  | 'majorFourteenth'
  | 'doubleOctave'

export type IntervalSliderStepDef = {
  key: IntervalSliderStepKey
  shortLabel: string
  semitones: number
  wholeTones: number
}

/** 教学白板音程滑块：与琴键横向对齐参考用 */
export const INTERVAL_SLIDER_STEP_DEFS: IntervalSliderStepDef[] = [
  { key: 'unison', shortLabel: '1', semitones: 0, wholeTones: 0 },
  { key: 'minorSecond', shortLabel: '♭2', semitones: 1, wholeTones: 0.5 },
  { key: 'majorSecond', shortLabel: '2', semitones: 2, wholeTones: 1 },
  { key: 'minorThird', shortLabel: '♭3', semitones: 3, wholeTones: 1.5 },
  { key: 'majorThird', shortLabel: '3', semitones: 4, wholeTones: 2 },
  { key: 'perfectFourth', shortLabel: '4', semitones: 5, wholeTones: 2.5 },
  { key: 'augmentedFourth', shortLabel: '♯4', semitones: 6, wholeTones: 3 },
  { key: 'perfectFifth', shortLabel: '5', semitones: 7, wholeTones: 3.5 },
  { key: 'minorSixth', shortLabel: '♭6', semitones: 8, wholeTones: 4 },
  { key: 'majorSixth', shortLabel: '6', semitones: 9, wholeTones: 4.5 },
  { key: 'minorSeventh', shortLabel: '♭7', semitones: 10, wholeTones: 5 },
  { key: 'majorSeventh', shortLabel: '7', semitones: 11, wholeTones: 5.5 },
  { key: 'octave', shortLabel: '8', semitones: 12, wholeTones: 6 },
  { key: 'minorNinth', shortLabel: '♭9', semitones: 13, wholeTones: 6.5 },
  { key: 'majorNinth', shortLabel: '9', semitones: 14, wholeTones: 7 },
  { key: 'minorTenth', shortLabel: '♭10', semitones: 15, wholeTones: 7.5 },
  { key: 'majorTenth', shortLabel: '10', semitones: 16, wholeTones: 8 },
  { key: 'perfectEleventh', shortLabel: '11', semitones: 17, wholeTones: 8.5 },
  { key: 'augmentedEleventh', shortLabel: '♯11', semitones: 18, wholeTones: 9 },
  { key: 'perfectTwelfth', shortLabel: '12', semitones: 19, wholeTones: 9.5 },
  { key: 'minorThirteenth', shortLabel: '♭13', semitones: 20, wholeTones: 10 },
  { key: 'majorThirteenth', shortLabel: '13', semitones: 21, wholeTones: 10.5 },
  { key: 'minorFourteenth', shortLabel: '♭14', semitones: 22, wholeTones: 11 },
  { key: 'majorFourteenth', shortLabel: '14', semitones: 23, wholeTones: 11.5 },
  { key: 'doubleOctave', shortLabel: '15', semitones: 24, wholeTones: 12 }
]

/** @deprecated 使用 INTERVAL_SLIDER_STEP_DEFS + i18n */
export const INTERVAL_SLIDER_STEPS = INTERVAL_SLIDER_STEP_DEFS.map((step) => ({
  name: step.key,
  shortLabel: step.shortLabel,
  semitones: step.semitones,
  wholeTones: step.wholeTones
}))

export function isIntervalSliderAnchor(index: number): boolean {
  return index === 0 || index === 7 || index === 12 || index === 24
}
