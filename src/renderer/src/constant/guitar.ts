/** 标准调弦 MIDI：6弦→1弦（低 E → 高 e） */
export const GUITAR_OPEN_MIDIS = [40, 45, 50, 55, 59, 64] as const

/** 与 guitar-body.svg / guitar-strings.svg 一致的几何（viewBox 0 0 400 1000） */
export const GUITAR_VIEW = {
  width: 400,
  height: 1000,
  nutY: 148,
  scaleLength: 520,
  fretCount: 20,
  /** 品丝 y（1..20），由十二平均律推算 */
  fretWireYs: [] as number[],
  /** 空弦品位中点用；nut 处弦 x：6弦→1弦 */
  nutXs: [185, 191, 197, 203, 209, 215] as const,
  /** 琴桥处弦 x：6弦→1弦 */
  bridgeXs: [176, 185.6, 195.2, 204.8, 214.4, 224] as const,
  /** 拨弦区 y（音孔附近） */
  pickY: 560,
  restLeft: { x: 48, y: 56 },
  restRight: { x: 352, y: 56 }
}

for (let n = 1; n <= GUITAR_VIEW.fretCount; n++) {
  GUITAR_VIEW.fretWireYs[n] = GUITAR_VIEW.nutY + GUITAR_VIEW.scaleLength * (1 - 2 ** (-n / 12))
}

export const NYLON_GUITAR_COLLECTION_ID = 4

export const GUITAR_SHORTCUT_STORAGE_KEY = 'jieShang.guitarChordShortcuts'

/** 弦号 1..6 → frets 数组下标（0=6弦） */
export function stringNumberToFretIndex(stringNumber: number): number {
  return 6 - stringNumber
}

export function fretWireY(fret: number): number {
  if (fret <= 0) return GUITAR_VIEW.nutY
  if (fret >= GUITAR_VIEW.fretCount) {
    return GUITAR_VIEW.fretWireYs[GUITAR_VIEW.fretCount] ?? GUITAR_VIEW.nutY + GUITAR_VIEW.scaleLength
  }
  return GUITAR_VIEW.fretWireYs[fret] ?? GUITAR_VIEW.nutY
}

/** 手指按在第 fret 品：位于 (fret-1) 与 fret 品丝之间 */
export function fretFingerY(fret: number): number {
  const y0 = fretWireY(Math.max(0, fret - 1))
  const y1 = fretWireY(fret)
  return (y0 + y1) / 2
}

export function stringXAtY(fretIndex: number, y: number): number {
  const i = Math.min(5, Math.max(0, fretIndex))
  const t = Math.min(
    1,
    Math.max(0, (y - GUITAR_VIEW.nutY) / GUITAR_VIEW.scaleLength)
  )
  const x0 = GUITAR_VIEW.nutXs[i]!
  const x1 = GUITAR_VIEW.bridgeXs[i]!
  return x0 + (x1 - x0) * t
}

export type GuitarFingerDot = {
  stringNumber: number
  fret: number
  finger: number
  x: number
  y: number
}

/**
 * 按品位从低到高、弦从粗到细分配 1~4 指；同品位相邻弦共享同一指（简易横按）。
 */
export function buildChordFingerDots(frets: number[]): GuitarFingerDot[] {
  if (!Array.isArray(frets) || frets.length !== 6) return []

  type Slot = { fretIndex: number; fret: number }
  const slots: Slot[] = []
  frets.forEach((fret, fretIndex) => {
    if (fret > 0) slots.push({ fretIndex, fret })
  })
  slots.sort((a, b) => a.fret - b.fret || a.fretIndex - b.fretIndex)

  const fingerByIndex = new Map<number, number>()
  let finger = 1
  let i = 0
  while (i < slots.length && finger <= 4) {
    const start = slots[i]!
    let j = i + 1
    while (j < slots.length && slots[j]!.fret === start.fret) j++
    for (let k = i; k < j; k++) {
      fingerByIndex.set(slots[k]!.fretIndex, finger)
    }
    finger += 1
    i = j
  }

  const dots: GuitarFingerDot[] = []
  frets.forEach((fret, fretIndex) => {
    const assigned = fingerByIndex.get(fretIndex)
    if (fret <= 0 || assigned == null) return
    const y = fretFingerY(fret)
    dots.push({
      stringNumber: 6 - fretIndex,
      fret,
      finger: assigned,
      x: stringXAtY(fretIndex, y),
      y
    })
  })
  return dots
}

export function midiForStringFret(stringNumber: number, fret: number): number | null {
  if (stringNumber < 1 || stringNumber > 6 || fret < 0) return null
  const open = GUITAR_OPEN_MIDIS[stringNumberToFretIndex(stringNumber)]
  if (open == null) return null
  return open + fret
}

/**
 * tabChord.stringStates 索引 0=1弦 → 绝对品位数组 [6弦…1弦]
 * -1 闷音，0 空弦，>0 绝对品位
 */
export function tabChordToFrets(chord: {
  baseFret?: number
  stringCount?: number
  stringStates?: Array<{ finger: 'x' | 'o' | number }>
}): number[] {
  const frets = [-1, -1, -1, -1, -1, -1]
  const base = Number(chord.baseFret) || 0
  const states = chord.stringStates ?? []
  const count = Math.min(6, chord.stringCount ?? states.length)
  for (let i = 0; i < count; i++) {
    const stringNumber = i + 1
    const fretIndex = stringNumberToFretIndex(stringNumber)
    const state = states[i]
    if (!state) continue
    if (state.finger === 'x') frets[fretIndex] = -1
    else if (state.finger === 'o') frets[fretIndex] = 0
    else if (typeof state.finger === 'number') frets[fretIndex] = base + state.finger + 1
  }
  return frets
}

/** 从 tabChord 生成吉他面板指位点（优先用 stringStates.text 作为指法号） */
export function buildFingerDotsFromTabChord(chord: {
  baseFret?: number
  stringCount?: number
  stringStates?: Array<{ finger: 'x' | 'o' | number; text?: string }>
}): GuitarFingerDot[] {
  const frets = tabChordToFrets(chord)
  const states = chord.stringStates ?? []
  const dots: GuitarFingerDot[] = []
  frets.forEach((fret, fretIndex) => {
    if (fret <= 0) return
    const stringNumber = 6 - fretIndex
    const state = states[stringNumber - 1]
    const fromText = Number(state?.text)
    const finger =
      Number.isFinite(fromText) && fromText > 0
        ? fromText
        : typeof state?.finger === 'number'
          ? Math.min(4, state.finger + 1)
          : 1
    const y = fretFingerY(fret)
    dots.push({
      stringNumber,
      fret,
      finger,
      x: stringXAtY(fretIndex, y),
      y
    })
  })
  return dots
}
