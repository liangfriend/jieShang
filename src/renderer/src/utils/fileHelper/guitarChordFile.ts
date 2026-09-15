import type { tabChord } from '@deciphony/renderer'
import { createEmptyChord } from '@deciphony/extensions/chord-builder'
import { tabChordToFrets } from '@renderer/constant/guitar'

export type GuitarChordRecord = {
  id: number
  name: string
  chord: tabChord
  /** 由 chord 推导，供吉他面板按弦/发声 */
  frets: number[]
  created_at?: string
  updated_at?: string
}

/** IPC 只能传可结构化克隆的纯对象，Vue Proxy 会报 DataCloneError */
function toPlainChord(chord: tabChord): tabChord {
  return JSON.parse(JSON.stringify(chord)) as tabChord
}

function parseTabChord(raw: unknown): tabChord {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Partial<tabChord>
    if (Array.isArray(obj.stringStates)) {
      return { ...createEmptyChord(), ...obj, name: obj.name?.trim() || 'Chord' } as tabChord
    }
  }
  if (typeof raw === 'string') {
    try {
      return parseTabChord(JSON.parse(raw))
    } catch {
      /* fallthrough */
    }
  }
  return createEmptyChord({ name: 'Chord' })
}

function mapRecord(row: {
  id: number
  name: string
  data?: string
  frets?: string
}): GuitarChordRecord {
  const chord = parseTabChord(row.data)
  if (!chord.name?.trim() && row.name) chord.name = row.name
  return {
    id: row.id,
    name: row.name || chord.name,
    chord,
    frets: tabChordToFrets(chord)
  }
}

export async function listGuitarChords(keyword = ''): Promise<GuitarChordRecord[]> {
  const res = keyword.trim()
    ? await window.api.guitarChord.searchByName(keyword)
    : await window.api.guitarChord.list()
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data.map(mapRecord)
}

export async function createGuitarChord(chord: tabChord): Promise<GuitarChordRecord> {
  const res = await window.api.guitarChord.create({ data: toPlainChord(chord) })
  if (!res.success || !res.data) throw new Error(res.error || 'create chord failed')
  return mapRecord(res.data)
}

export async function updateGuitarChord(id: number, chord: tabChord): Promise<GuitarChordRecord> {
  const res = await window.api.guitarChord.update(id, { data: toPlainChord(chord) })
  if (!res.success || !res.data) throw new Error(res.error || 'update chord failed')
  return mapRecord(res.data)
}

export async function deleteGuitarChord(id: number): Promise<void> {
  const res = await window.api.guitarChord.delete(id)
  if (!res.success) throw new Error(res.error || 'delete chord failed')
}
