export type IntervalSliderStep = {
  name: string
  shortLabel: string
  semitones: number
  wholeTones: number
}

/** 教学白板音程滑块：与琴键横向对齐参考用 */
export const INTERVAL_SLIDER_STEPS: IntervalSliderStep[] = [
  { name: '纯一度', shortLabel: '1', semitones: 0, wholeTones: 0 },
  { name: '小二度', shortLabel: '♭2', semitones: 1, wholeTones: 0.5 },
  { name: '大二度', shortLabel: '2', semitones: 2, wholeTones: 1 },
  { name: '小三度', shortLabel: '♭3', semitones: 3, wholeTones: 1.5 },
  { name: '大三度', shortLabel: '3', semitones: 4, wholeTones: 2 },
  { name: '纯四度', shortLabel: '4', semitones: 5, wholeTones: 2.5 },
  { name: '增四度', shortLabel: '♯4', semitones: 6, wholeTones: 3 },
  { name: '纯五度', shortLabel: '5', semitones: 7, wholeTones: 3.5 },
  { name: '小六度', shortLabel: '♭6', semitones: 8, wholeTones: 4 },
  { name: '大六度', shortLabel: '6', semitones: 9, wholeTones: 4.5 },
  { name: '小七度', shortLabel: '♭7', semitones: 10, wholeTones: 5 },
  { name: '大七度', shortLabel: '7', semitones: 11, wholeTones: 5.5 },
  { name: '纯八度', shortLabel: '8', semitones: 12, wholeTones: 6 },
  { name: '小九度', shortLabel: '♭9', semitones: 13, wholeTones: 6.5 },
  { name: '大九度', shortLabel: '9', semitones: 14, wholeTones: 7 },
  { name: '小十度', shortLabel: '♭10', semitones: 15, wholeTones: 7.5 },
  { name: '大十度', shortLabel: '10', semitones: 16, wholeTones: 8 },
  { name: '纯十一度', shortLabel: '11', semitones: 17, wholeTones: 8.5 },
  { name: '增十一度', shortLabel: '♯11', semitones: 18, wholeTones: 9 },
  { name: '纯十二度', shortLabel: '12', semitones: 19, wholeTones: 9.5 },
  { name: '小十三度', shortLabel: '♭13', semitones: 20, wholeTones: 10 },
  { name: '大十三度', shortLabel: '13', semitones: 21, wholeTones: 10.5 },
  { name: '小十四度', shortLabel: '♭14', semitones: 22, wholeTones: 11 },
  { name: '大十四度', shortLabel: '14', semitones: 23, wholeTones: 11.5 },
  { name: '纯十五度', shortLabel: '15', semitones: 24, wholeTones: 12 }
]

export function isIntervalSliderAnchor(index: number): boolean {
  return index === 0 || index === 7 || index === 12 || index === 24
}
