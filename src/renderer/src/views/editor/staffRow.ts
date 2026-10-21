import type { MusicScore, SingleStaff } from '@deciphony/renderer'

/** 单谱表音量（百分比）存放在 singleStaff.data 上的键；播放端按此读取 */
export const STAFF_VOLUME_KEY = 'volume'
export const DEFAULT_STAFF_VOLUME = 100
export const MAX_STAFF_VOLUME = 200

type StaffDataBag = Record<string, unknown>

function staffData(staff: SingleStaff): StaffDataBag {
  if (!staff.data || typeof staff.data !== 'object') staff.data = {}
  return staff.data as StaffDataBag
}

export function readStaffVolume(staff: SingleStaff): number {
  const value = (staff.data as StaffDataBag | null | undefined)?.[STAFF_VOLUME_KEY]
  return typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_STAFF_VOLUME
}

export function writeStaffVolume(staff: SingleStaff, volume: number): void {
  staffData(staff)[STAFF_VOLUME_KEY] = volume
}

/** 没有音量字段时补上默认值，保证之后读到的都是明确的数 */
export function ensureStaffVolume(staff: SingleStaff): void {
  const data = staffData(staff)
  if (typeof data[STAFF_VOLUME_KEY] !== 'number') data[STAFF_VOLUME_KEY] = DEFAULT_STAFF_VOLUME
}

function locateStaff(musicScore: MusicScore, target: SingleStaff): { grandIndex: number; index: number } | null {
  const grandStaffs = musicScore.grandStaffs ?? []
  for (let g = 0; g < grandStaffs.length; g++) {
    const index = grandStaffs[g].staves.findIndex((item) => item.id === target.id)
    if (index >= 0) return { grandIndex: g, index }
  }
  return null
}

function stavesAtIndex(musicScore: MusicScore, index: number, fromGrandIndex: number): SingleStaff[] {
  return (musicScore.grandStaffs ?? [])
    .slice(fromGrandIndex)
    .map((grandStaff) => grandStaff.staves[index])
    .filter((item): item is SingleStaff => item != null)
}

/** 总谱逻辑：目标所在复谱表及其之后各复谱表中同索引的单谱表（同一声部）；找不到目标时仅返回目标本身 */
export function sameRowStavesFrom(musicScore: MusicScore, target: SingleStaff): SingleStaff[] {
  const location = locateStaff(musicScore, target)
  return location ? stavesAtIndex(musicScore, location.index, location.grandIndex) : [target]
}

/** 所有复谱表中与目标同索引的单谱表；找不到目标时仅返回目标本身 */
export function sameRowStaves(musicScore: MusicScore, target: SingleStaff): SingleStaff[] {
  const location = locateStaff(musicScore, target)
  return location ? stavesAtIndex(musicScore, location.index, 0) : [target]
}
