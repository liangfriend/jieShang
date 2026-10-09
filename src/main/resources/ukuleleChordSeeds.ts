/**
 * 尤克里里（GCEA 高音 G）常用开放把位和弦。
 * stringStates 索引 0 = 1 弦（A，右侧），3 = 4 弦（G）。
 * finger 数字为相对品：0 = 第 1 品（baseFret=0 时）。
 * 暂无虚拟乐器，不附带手型。
 */
type SeedStringState = { finger: 'x' | 'o' | number; text: string }

export type UkuleleChordSeed = {
  dbId: number
  id: string
  width: number
  height: number
  stringCount: 4
  name: string
  fretCount: number
  baseFret: number
  barres: Array<{
    fret: number
    startStringNumber: number
    endStringNumber: number
    text: string[]
  }>
  /** 与 stringStates 同序：1→4 弦 = A E C G */
  tuning: string[]
  stringStates: SeedStringState[]
  textSize: number
  nameSize: number
  relativeX: number
  relativeY: number
  relativeW: number
  relativeH: number
}

/** 内置尤克里里九和弦固定 id（与吉他 1~9 错开） */
export const BUILTIN_UKULELE_CHORD_SEED_IDS = {
  C: 101,
  G: 102,
  Am: 103,
  Em: 104,
  D: 105,
  F: 106,
  E: 107,
  A: 108,
  Dm: 109
} as const

const UKE_TUNING = ['A', 'E', 'C', 'G'] as const

function makeUkeChord(
  name: keyof typeof BUILTIN_UKULELE_CHORD_SEED_IDS,
  stringStates: SeedStringState[],
  barres: UkuleleChordSeed['barres'] = []
): UkuleleChordSeed {
  return {
    dbId: BUILTIN_UKULELE_CHORD_SEED_IDS[name],
    id: `builtin-ukulele-chord-${name}`,
    width: 34,
    height: 40,
    stringCount: 4,
    name,
    fretCount: 5,
    baseFret: 0,
    barres,
    tuning: [...UKE_TUNING],
    stringStates,
    textSize: 7,
    nameSize: 12,
    relativeX: 0,
    relativeY: 0,
    relativeW: 1,
    relativeH: 1
  }
}

/**
 * GCEA 记法（G→A）对照：
 * C 0003 · G 0232 · Am 2000 · F 2010 · Em 0432 · Dm 2210 · D 2220 · A 2100 · E 1402
 * 下列 stringStates 已换成 1→4 弦（A E C G）顺序。
 */
export const DEFAULT_UKULELE_CHORD_SEEDS: UkuleleChordSeed[] = [
  // C: A3 C0 E0 G0
  makeUkeChord('C', [
    { finger: 2, text: '1' },
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 'o', text: '' }
  ]),
  // G: A2 E3 C2 G0
  makeUkeChord('G', [
    { finger: 1, text: '2' },
    { finger: 2, text: '3' },
    { finger: 1, text: '1' },
    { finger: 'o', text: '' }
  ]),
  // Am: A0 E0 C0 G2
  makeUkeChord('Am', [
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 1, text: '1' }
  ]),
  // Em: A2 E3 C4 G0
  makeUkeChord('Em', [
    { finger: 1, text: '1' },
    { finger: 2, text: '2' },
    { finger: 3, text: '3' },
    { finger: 'o', text: '' }
  ]),
  // D: A0 E2 C2 G2
  makeUkeChord('D', [
    { finger: 'o', text: '' },
    { finger: 1, text: '1' },
    { finger: 1, text: '2' },
    { finger: 1, text: '3' }
  ]),
  // F: A0 E1 C0 G2
  makeUkeChord('F', [
    { finger: 'o', text: '' },
    { finger: 0, text: '1' },
    { finger: 'o', text: '' },
    { finger: 1, text: '2' }
  ]),
  // E: A2 E0 C4 G1
  makeUkeChord('E', [
    { finger: 1, text: '2' },
    { finger: 'o', text: '' },
    { finger: 3, text: '3' },
    { finger: 0, text: '1' }
  ]),
  // A: A0 E0 C1 G2
  makeUkeChord('A', [
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 0, text: '1' },
    { finger: 1, text: '2' }
  ]),
  // Dm: A0 E1 C2 G2
  makeUkeChord('Dm', [
    { finger: 'o', text: '' },
    { finger: 0, text: '1' },
    { finger: 1, text: '2' },
    { finger: 1, text: '3' }
  ])
]

export function seedUkuleleTabChordJson(seed: UkuleleChordSeed): string {
  const { dbId: _dbId, ...chord } = seed
  return JSON.stringify(chord)
}
