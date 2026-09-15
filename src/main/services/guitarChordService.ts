import { randomUUID } from 'crypto'
import { GuitarChordRepository } from '../repositories/guitarChordRepository'

type SeedStringState = { finger: 'x' | 'o' | number; text: string }

type SeedTabChord = {
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

function makeChord(
  name: string,
  stringStates: SeedStringState[],
  barres: SeedTabChord['barres'] = []
): SeedTabChord {
  return {
    id: randomUUID(),
    width: 50,
    height: 60,
    stringCount: 6,
    name,
    fretCount: 5,
    baseFret: 0,
    barres,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    stringStates,
    textSize: 10,
    nameSize: 32,
    relativeX: 0,
    relativeY: 0,
    relativeW: 1,
    relativeH: 1
  }
}

/** 默认 tabChord 种子（stringStates 索引 0 = 1 弦） */
export const DEFAULT_GUITAR_CHORD_SEEDS: SeedTabChord[] = [
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

function normalizeTabChord(raw: unknown): { name: string; data: string } | null {
  if (!raw || typeof raw !== 'object') return null
  const chord = raw as Record<string, unknown>
  const name = typeof chord.name === 'string' ? chord.name.trim() : ''
  if (!name) return null
  if (!Array.isArray(chord.stringStates)) return null
  const stringCount = Number(chord.stringCount)
  if (!Number.isFinite(stringCount) || stringCount < 4 || stringCount > 8) return null
  return {
    name,
    data: JSON.stringify({
      ...chord,
      name,
      id: typeof chord.id === 'string' && chord.id ? chord.id : randomUUID()
    })
  }
}

export class GuitarChordService {
  private guitarChordRepository: GuitarChordRepository

  constructor({ guitarChordRepository }) {
    this.guitarChordRepository = guitarChordRepository
  }

  async ensureDefaultChords() {
    const count = await this.guitarChordRepository.count()
    if (count > 0) return
    for (const seed of DEFAULT_GUITAR_CHORD_SEEDS) {
      await this.guitarChordRepository.create({
        name: seed.name,
        data: JSON.stringify({ ...seed, id: randomUUID() })
      })
    }
  }

  async createChord(payload: { data: unknown }) {
    const normalized = normalizeTabChord(payload?.data)
    if (!normalized) return { success: false, error: 'invalid tabChord data' }
    const data = await this.guitarChordRepository.create(normalized)
    return { success: true, data }
  }

  async deleteChord(id: string | number) {
    const row = await this.guitarChordRepository.findById(id)
    if (!row) return { success: false, error: 'chord not found' }
    const data = await this.guitarChordRepository.delete(id)
    return { success: true, data }
  }

  async updateChord(id: string | number, payload: { data?: unknown }) {
    const row = await this.guitarChordRepository.findById(id)
    if (!row) return { success: false, error: 'chord not found' }
    if (payload.data === undefined) {
      return { success: true, data: row }
    }
    const normalized = normalizeTabChord(payload.data)
    if (!normalized) return { success: false, error: 'invalid tabChord data' }
    const data = await this.guitarChordRepository.update(id, normalized)
    return { success: true, data }
  }

  async getChord(id: string | number) {
    const data = await this.guitarChordRepository.findById(id)
    return { success: true, data }
  }

  async listChords() {
    await this.ensureDefaultChords()
    const data = await this.guitarChordRepository.list()
    return { success: true, data }
  }

  async searchByName(name: string) {
    await this.ensureDefaultChords()
    const data = await this.guitarChordRepository.searchByName(name)
    return { success: true, data }
  }
}
