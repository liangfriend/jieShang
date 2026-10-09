import type { tabChord } from '@deciphony/renderer'
import { NoteName } from '@deciphony/renderer'
import { createEmptyChord } from '@deciphony/extensions/chord-builder'
import { SCORE_TAB_CHORD_LAYOUT, tabChordToFrets } from '@renderer/constant/guitar'
import {
  isFingerPoseMap,
  type FingerPoseMap
} from '@renderer/utils/guitarFingerPose'

export type GuitarChordTabType = 'tab4' | 'tab5' | 'tab6'

/** 和弦管理里的展示顺序 */
export const GUITAR_CHORD_TAB_TYPES: GuitarChordTabType[] = ['tab6', 'tab5', 'tab4']

export function tabTypeStringCount(tabType: GuitarChordTabType): number {
  if (tabType === 'tab4') return 4
  if (tabType === 'tab5') return 5
  return 6
}

/** 谱面弦数 → 和弦类型：4 弦用四弦和弦，5 弦用五弦和弦，其余用六弦和弦 */
export function tabTypeForStringCount(stringCount: number): GuitarChordTabType {
  if (stringCount === 4) return 'tab4'
  if (stringCount === 5) return 'tab5'
  return 'tab6'
}

export type GuitarChordRecord = {
  id: number
  name: string
  chord: tabChord
  /** tab4=四弦（尤克里里）；tab5=五弦（贝斯）；tab6=六弦（吉他） */
  tabType: GuitarChordTabType
  /** 由 chord 推导，供吉他面板按弦/发声 */
  frets: number[]
  /** 按弦手型；未编辑为 null */
  handPose: FingerPoseMap | null
  created_at?: string
  updated_at?: string
}

/** IPC 只能传可结构化克隆的纯对象，Vue Proxy 会报 DataCloneError */
function toPlainChord(chord: tabChord): tabChord {
  return JSON.parse(JSON.stringify(chord)) as tabChord
}

function toPlainHandPose(pose: FingerPoseMap | null | undefined): FingerPoseMap | null {
  if (!isFingerPoseMap(pose)) return null
  return JSON.parse(JSON.stringify(pose)) as FingerPoseMap
}

function parseTabType(raw: unknown, chord: tabChord): GuitarChordTabType {
  if (raw === 'tab4' || raw === 'tab5' || raw === 'tab6') return raw
  return tabTypeForStringCount(Number(chord.stringCount))
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
  return { ...createEmptyChord(), name: 'Chord' }
}

function parseHandPose(raw: unknown): FingerPoseMap | null {
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') {
    try {
      return parseHandPose(JSON.parse(raw))
    } catch {
      return null
    }
  }
  return isFingerPoseMap(raw) ? (raw as FingerPoseMap) : null
}

function mapRecord(row: {
  id: number
  name: string
  data?: string
  hand_pose?: string | null
  tab_type?: string
  frets?: string
}): GuitarChordRecord {
  const chord = parseTabChord(row.data)
  if (!chord.name?.trim() && row.name) chord.name = row.name
  const tabType = parseTabType(row.tab_type, chord)
  chord.stringCount = tabTypeStringCount(tabType)
  return {
    id: row.id,
    name: row.name || chord.name,
    chord,
    tabType,
    frets: tabChordToFrets(chord),
    handPose: parseHandPose(row.hand_pose)
  }
}

export async function listGuitarChords(
  keyword = '',
  tabType: GuitarChordTabType | 'all' = 'all'
): Promise<GuitarChordRecord[]> {
  const res = await window.api.guitarChord.list({
    keyword: keyword.trim() || undefined,
    tabType
  })
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data.map(mapRecord)
}

export async function createGuitarChord(
  chord: tabChord,
  handPose: FingerPoseMap | null = null,
  tabType: GuitarChordTabType = 'tab6'
): Promise<GuitarChordRecord> {
  const locked: tabChord = {
    ...toPlainChord(chord),
    stringCount: tabTypeStringCount(tabType)
  }
  const res = await window.api.guitarChord.create({
    data: locked,
    hand_pose: toPlainHandPose(handPose),
    tab_type: tabType
  })
  if (!res.success || !res.data) throw new Error(res.error || 'create chord failed')
  return mapRecord(res.data)
}

export async function updateGuitarChord(
  id: number,
  chord: tabChord,
  handPose: FingerPoseMap | null = null
): Promise<GuitarChordRecord> {
  const res = await window.api.guitarChord.update(id, {
    data: toPlainChord(chord),
    hand_pose: toPlainHandPose(handPose)
  })
  if (!res.success || !res.data) throw new Error(res.error || 'update chord failed')
  return mapRecord(res.data)
}

export async function deleteGuitarChord(id: number): Promise<void> {
  const res = await window.api.guitarChord.delete(id)
  if (!res.success) throw new Error(res.error || 'delete chord failed')
}

export function createEmptyChordForTabType(tabType: GuitarChordTabType, name = ''): tabChord {
  return createEmptyChord({
    name,
    stringCount: tabTypeStringCount(tabType),
    width: SCORE_TAB_CHORD_LAYOUT.width,
    height: SCORE_TAB_CHORD_LAYOUT.height,
    textSize: SCORE_TAB_CHORD_LAYOUT.textSize,
    nameSize: SCORE_TAB_CHORD_LAYOUT.nameSize,
    // Chord 组件 / stringStates：索引 0 = 1 弦（最右侧）
    ...(tabType === 'tab4' ? { tuning: [NoteName.A, NoteName.E, NoteName.C, NoteName.G] } : {}),
    ...(tabType === 'tab5'
      ? { tuning: [NoteName.G, NoteName.D, NoteName.A, NoteName.E, NoteName.B] }
      : {})
  })
}
