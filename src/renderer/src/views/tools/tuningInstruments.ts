/**
 * 调弦乐器预设。新增乐器：在 TUNING_INSTRUMENTS 追加一项并补 i18n `tools.guitarTune.instruments.<id>`。
 *
 * 坐标系：SVG viewBox 横向 0–280、纵向 0–360，弦枕以下为指板方向。
 * 弦 id 按惯例：1 为最细/最高音弦，数字越大越靠低音侧。
 */

export interface TuningString {
  id: number
  label: string
  midi: number
  /** 画在琴头上的弦粗细 */
  width: number
  color: string
}

export interface HeadstockPeg {
  stringId: number
  side: 'left' | 'right'
  /** 旋钮与弦柱同高 */
  y: number
  pegX: number
  postX: number
}

export interface HeadstockShape {
  bodyPath: string
  pegs: HeadstockPeg[]
  pegR: number
  /** 旋钮轴从琴头背面穿过时为 true：先画轴再画琴头，被琴头遮住 */
  shaftUnderBody?: boolean
  nutY: number
  nutLeft: number
  nutRight: number
  /** 弦枕处各弦 x */
  nutX: Record<number, number>
}

export interface TuningInstrument {
  id: string
  /** 低音侧 → 高音侧 */
  strings: TuningString[]
  shape: HeadstockShape
  defaultStringId: number
  /** 静音门限：拨弦音量小的乐器取低值 */
  silenceRms: number
}

/**
 * 两侧对称排布（3+3、2+2）：左侧低音组内侧弦在上，右侧高音组内侧弦在上，两侧最外弦最靠弦枕。
 */
function splitPegs(
  stringIds: number[],
  leftCount: number,
  pegY: number[],
  x: { pegLeft: number; pegRight: number; postLeft: number; postRight: number }
): HeadstockPeg[] {
  const left = stringIds.slice(0, leftCount).reverse()
  const right = stringIds.slice(leftCount)
  return [
    ...left.map((stringId, i) => ({
      stringId,
      side: 'left' as const,
      y: pegY[i]!,
      pegX: x.pegLeft,
      postX: x.postLeft
    })),
    ...right.map((stringId, i) => ({
      stringId,
      side: 'right' as const,
      y: pegY[i]!,
      pegX: x.pegRight,
      postX: x.postRight
    }))
  ]
}

const BRONZE = '#9a7440'
const BRONZE_LIGHT = '#a8814c'
const STEEL = '#8a8f98'
const STEEL_LIGHT = '#a8aeb6'
const NYLON = '#e8e0cc'

const GUITAR_STANDARD: TuningInstrument = {
  id: 'guitarStandard',
  strings: [
    { id: 6, label: 'E', midi: 40, width: 2.8, color: BRONZE },
    { id: 5, label: 'A', midi: 45, width: 2.3, color: BRONZE },
    { id: 4, label: 'D', midi: 50, width: 1.9, color: BRONZE_LIGHT },
    { id: 3, label: 'G', midi: 55, width: 1.4, color: STEEL },
    { id: 2, label: 'B', midi: 59, width: 1.05, color: '#9aa0a8' },
    { id: 1, label: 'E', midi: 64, width: 0.8, color: STEEL_LIGHT }
  ],
  shape: {
    bodyPath:
      'M70 28 C70 12 90 4 140 4 C190 4 210 12 210 28 L222 210 C224 240 210 255 140 255 C70 255 56 240 58 210 Z',
    pegs: splitPegs([6, 5, 4, 3, 2, 1], 3, [70, 128, 186], {
      pegLeft: 48,
      pegRight: 232,
      postLeft: 92,
      postRight: 188
    }),
    pegR: 16,
    nutY: 250,
    nutLeft: 96,
    nutRight: 184,
    nutX: { 6: 108, 5: 120, 4: 132, 3: 148, 2: 160, 1: 172 }
  },
  defaultStringId: 1,
  silenceRms: 0.008
}

const BASS_4: TuningInstrument = {
  id: 'bass4',
  strings: [
    { id: 4, label: 'E', midi: 28, width: 4.2, color: STEEL },
    { id: 3, label: 'A', midi: 33, width: 3.5, color: STEEL },
    { id: 2, label: 'D', midi: 38, width: 2.9, color: '#9aa0a8' },
    { id: 1, label: 'G', midi: 43, width: 2.3, color: STEEL_LIGHT }
  ],
  /**
   * 四联排单侧：旋钮全在左侧，沿左缘斜线从左下到右上依次 E A D G；
   * 弦从弦枕直上到各自弦柱，E 最短最靠下。
   */
  shape: {
    bodyPath:
      'M98 255 L92 232 C80 222 64 212 64 196 L110 30 C118 10 150 4 172 12 C192 20 194 40 188 62 C184 90 184 160 184 222 L182 255 Z',
    pegs: [
      { stringId: 4, side: 'left', y: 206, pegX: 36, postX: 110 },
      { stringId: 3, side: 'left', y: 156, pegX: 49, postX: 131 },
      { stringId: 2, side: 'left', y: 106, pegX: 63, postX: 149 },
      { stringId: 1, side: 'left', y: 56, pegX: 77, postX: 170 }
    ],
    pegR: 18,
    shaftUnderBody: true,
    nutY: 250,
    nutLeft: 98,
    nutRight: 182,
    nutX: { 4: 110, 3: 131, 2: 149, 1: 170 }
  },
  defaultStringId: 1,
  silenceRms: 0.008
}

/** 尤克里里标准 re-entrant：G C E A，四弦 G 高八度 */
const UKULELE: TuningInstrument = {
  id: 'ukulele',
  strings: [
    { id: 4, label: 'G', midi: 67, width: 1.5, color: NYLON },
    { id: 3, label: 'C', midi: 60, width: 1.9, color: NYLON },
    { id: 2, label: 'E', midi: 64, width: 1.7, color: NYLON },
    { id: 1, label: 'A', midi: 69, width: 1.3, color: NYLON }
  ],
  shape: {
    bodyPath:
      'M84 70 C80 40 108 26 140 26 C172 26 200 40 196 70 L204 214 C206 242 192 255 140 255 C88 255 74 242 76 214 Z',
    pegs: splitPegs([4, 3, 2, 1], 2, [118, 186], {
      pegLeft: 58,
      pegRight: 222,
      postLeft: 102,
      postRight: 178
    }),
    pegR: 13,
    nutY: 250,
    nutLeft: 106,
    nutRight: 174,
    nutX: { 4: 115, 3: 131, 2: 149, 1: 165 }
  },
  defaultStringId: 1,
  silenceRms: 0.006
}

export const TUNING_INSTRUMENTS: TuningInstrument[] = [GUITAR_STANDARD, BASS_4, UKULELE]

export function findTuningInstrument(id: string): TuningInstrument {
  return TUNING_INSTRUMENTS.find((i) => i.id === id) ?? GUITAR_STANDARD
}
