import { GUITAR_CHORD_SEED_HAND_POSES } from './guitarChordSeedHandPoses'

type SeedStringState = { finger: 'x' | 'o' | number; text: string }

export type GuitarChordSeed = {
  dbId: number
  id: string
  width: number
  height: number
  stringCount: number
  name: string
  fretCount: number
  baseFret: number
  barres: Array<{
    fret: number
    startStringNumber: number
    endStringNumber: number
    text: string[]
  }>
  tuning: string[]
  stringStates: SeedStringState[]
  textSize: number
  nameSize: number
  relativeX: number
  relativeY: number
  relativeW: number
  relativeH: number
}

/** 内置九和弦固定 id（快捷键 1~9 按此顺序） */
export const BUILTIN_GUITAR_CHORD_SEED_IDS = {
  C: 1,
  G: 2,
  Am: 3,
  Em: 4,
  D: 5,
  F: 6,
  E: 7,
  A: 8,
  Dm: 9
} as const

function makeChord(
  name: keyof typeof BUILTIN_GUITAR_CHORD_SEED_IDS,
  stringStates: SeedStringState[],
  barres: GuitarChordSeed['barres'] = []
): GuitarChordSeed {
  return {
    dbId: BUILTIN_GUITAR_CHORD_SEED_IDS[name],
    id: `builtin-guitar-chord-${name}`,
    width: 34,
    height: 40,
    stringCount: 6,
    name,
    fretCount: 5,
    baseFret: 0,
    barres,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    stringStates,
    textSize: 7,
    nameSize: 12,
    relativeX: 0,
    relativeY: 0,
    relativeW: 1,
    relativeH: 1
  }
}

export const DEFAULT_GUITAR_CHORD_SEEDS: GuitarChordSeed[] = [
  makeChord('C', [
    { finger: 'o', text: '' },
    { finger: 0, text: '1' },
    { finger: 'o', text: '' },
    { finger: 1, text: '2' },
    { finger: 2, text: '3' },
    { finger: 'x', text: '' }
  ]),
  makeChord('G', [
    { finger: 2, text: '3' },
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 1, text: '2' },
    { finger: 2, text: '3' }
  ]),
  makeChord('Am', [
    { finger: 'o', text: '' },
    { finger: 0, text: '1' },
    { finger: 1, text: '2' },
    { finger: 1, text: '3' },
    { finger: 'o', text: '' },
    { finger: 'x', text: '' }
  ]),
  makeChord('Em', [
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 1, text: '2' },
    { finger: 1, text: '3' },
    { finger: 'o', text: '' }
  ]),
  makeChord('D', [
    { finger: 1, text: '2' },
    { finger: 2, text: '3' },
    { finger: 1, text: '1' },
    { finger: 'o', text: '' },
    { finger: 'x', text: '' },
    { finger: 'x', text: '' }
  ]),
  makeChord(
    'F',
    [
      { finger: 0, text: '1' },
      { finger: 0, text: '1' },
      { finger: 1, text: '2' },
      { finger: 2, text: '3' },
      { finger: 3, text: '4' },
      { finger: 0, text: '1' }
    ],
    [
      {
        fret: 0,
        startStringNumber: 0,
        endStringNumber: 5,
        text: ['1', '1', '1', '1', '1', '1']
      }
    ]
  ),
  makeChord('E', [
    { finger: 'o', text: '' },
    { finger: 'o', text: '' },
    { finger: 0, text: '1' },
    { finger: 1, text: '2' },
    { finger: 1, text: '3' },
    { finger: 'o', text: '' }
  ]),
  makeChord('A', [
    { finger: 'o', text: '' },
    { finger: 1, text: '2' },
    { finger: 1, text: '3' },
    { finger: 1, text: '4' },
    { finger: 'o', text: '' },
    { finger: 'x', text: '' }
  ]),
  makeChord('Dm', [
    { finger: 0, text: '1' },
    { finger: 2, text: '3' },
    { finger: 1, text: '2' },
    { finger: 'o', text: '' },
    { finger: 'x', text: '' },
    { finger: 'x', text: '' }
  ])
]

export function seedTabChordJson(seed: GuitarChordSeed): string {
  const { dbId: _dbId, ...chord } = seed
  return JSON.stringify(chord)
}

export function seedHandPoseJson(name: string): string | null {
  const pose = GUITAR_CHORD_SEED_HAND_POSES[name]
  return pose ? JSON.stringify(pose) : null
}
