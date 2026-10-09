/**
 * 五弦贝斯（B E A D G）常用低把位三和弦。
 * stringStates 索引 0 = 1 弦（G，右侧），4 = 5 弦（低音 B）。
 * finger 数字为相对品格：0 = 第 1 品（baseFret=0 时）。
 * 暂无虚拟乐器，不附带手型。
 */
type SeedStringState = { finger: 'x' | 'o' | number; text: string }

export type Bass5ChordSeed = {
  dbId: number
  id: string
  width: number
  height: number
  stringCount: 5
  name: string
  fretCount: number
  baseFret: number
  barres: Array<{
    fret: number
    startStringNumber: number
    endStringNumber: number
    text: string[]
  }>
  /** 与 stringStates 同序：1→5 弦 = G D A E B */
  tuning: string[]
  stringStates: SeedStringState[]
  textSize: number
  nameSize: number
  relativeX: number
  relativeY: number
  relativeW: number
  relativeH: number
}

/** 内置五弦和弦固定 id（与吉他 1~9、尤克里里 101~109 错开） */
export const BUILTIN_BASS5_CHORD_SEED_IDS = {
  C: 201,
  G: 202,
  Am: 203,
  Em: 204,
  D: 205,
  F: 206,
  E: 207,
  A: 208,
  Dm: 209
} as const

const BASS5_TUNING = ['G', 'D', 'A', 'E', 'B'] as const

const X: SeedStringState = { finger: 'x', text: '' }
const O: SeedStringState = { finger: 'o', text: '' }

/** fret 为实际品格（1 起），text 为手指编号 */
function press(fret: number, text: string): SeedStringState {
  return { finger: fret - 1, text }
}

function makeBass5Chord(
  name: keyof typeof BUILTIN_BASS5_CHORD_SEED_IDS,
  stringStates: SeedStringState[]
): Bass5ChordSeed {
  return {
    dbId: BUILTIN_BASS5_CHORD_SEED_IDS[name],
    id: `builtin-bass5-chord-${name}`,
    width: 34,
    height: 40,
    stringCount: 5,
    name,
    fretCount: 5,
    baseFret: 0,
    barres: [],
    tuning: [...BASS5_TUNING],
    stringStates,
    textSize: 7,
    nameSize: 12,
    relativeX: 0,
    relativeY: 0,
    relativeW: 1,
    relativeH: 1
  }
}

/** 下列 stringStates 按 1→5 弦（G D A E B）顺序 */
export const DEFAULT_BASS5_CHORD_SEEDS: Bass5ChordSeed[] = [
  // C: B1(C) A3(C) D2(E) G0(G)
  makeBass5Chord('C', [O, press(2, '2'), press(3, '3'), X, press(1, '1')]),
  // G: E3(G) A2(B) D0(D) G0(G)
  makeBass5Chord('G', [O, O, press(2, '1'), press(3, '2'), X]),
  // Am: E5(A) A3(C) D2(E)
  makeBass5Chord('Am', [X, press(2, '1'), press(3, '2'), press(5, '4'), X]),
  // Em: E0(E) A2(B) D2(E) G0(G)
  makeBass5Chord('Em', [O, press(2, '2'), press(2, '1'), O, X]),
  // D: E2(F#) A0(A) D0(D) G2(A)
  makeBass5Chord('D', [press(2, '2'), O, O, press(2, '1'), X]),
  // F: E1(F) A3(C) D3(F) G2(A)
  makeBass5Chord('F', [press(2, '2'), press(3, '4'), press(3, '3'), press(1, '1'), X]),
  // E: E0(E) A2(B) D2(E) G1(G#)
  makeBass5Chord('E', [press(1, '1'), press(2, '3'), press(2, '2'), O, X]),
  // A: E5(A) A4(C#) D2(E)
  makeBass5Chord('A', [X, press(2, '1'), press(4, '3'), press(5, '4'), X]),
  // Dm: E1(F) A0(A) D0(D) G2(A)
  makeBass5Chord('Dm', [press(2, '2'), O, O, press(1, '1'), X])
]

export function seedBass5TabChordJson(seed: Bass5ChordSeed): string {
  const { dbId: _dbId, ...chord } = seed
  return JSON.stringify(chord)
}
