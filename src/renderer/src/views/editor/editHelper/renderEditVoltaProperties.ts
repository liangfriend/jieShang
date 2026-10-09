import type { DoubleMeasureAffiliatedSymbol, MusicScore, SingleStaff, SlotData } from '@deciphony/renderer'

export type VoltaEditSlot = SlotData & {
  musicScore: MusicScore
  self: DoubleMeasureAffiliatedSymbol
}

type VoltaStaffLocation = {
  staff: SingleStaff
  startIdx: number
  endIdx: number
  lo: number
  hi: number
}

function ensureVoltaData(volta: DoubleMeasureAffiliatedSymbol) {
  if (!volta.data.volta) {
    volta.data.volta = { text: '1.', value: [0] }
  }
  return volta.data.volta
}

export function setVoltaText(volta: DoubleMeasureAffiliatedSymbol, text: string): void {
  ensureVoltaData(volta).text = text
}

export function setVoltaValue(volta: DoubleMeasureAffiliatedSymbol, value: number[]): void {
  ensureVoltaData(volta).value = value.length > 0 ? value : [0]
}

/** 闭合 = 非 open；缺省视为闭合 */
export function getVoltaClosedLeft(volta: DoubleMeasureAffiliatedSymbol): boolean {
  return ensureVoltaData(volta).openLeft !== true
}

export function getVoltaClosedRight(volta: DoubleMeasureAffiliatedSymbol): boolean {
  return ensureVoltaData(volta).openRight !== true
}

export function setVoltaClosedLeft(volta: DoubleMeasureAffiliatedSymbol, closed: boolean): void {
  ensureVoltaData(volta).openLeft = !closed
}

export function setVoltaClosedRight(volta: DoubleMeasureAffiliatedSymbol, closed: boolean): void {
  ensureVoltaData(volta).openRight = !closed
}

/** 重置左右对齐：清掉拖拽产生的 relativeX / relativeW */
export function resetVoltaHorizontalOffset(volta: DoubleMeasureAffiliatedSymbol): void {
  const data = ensureVoltaData(volta)
  delete data.relativeX
  delete data.relativeW
}

export function locateVoltaOnStaff(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): VoltaStaffLocation | null {
  const { startId, endId } = volta
  for (const grandStaff of musicScore.grandStaffs) {
    for (const staff of grandStaff.staves) {
      const startIdx = staff.measures.findIndex((m) => m.id === startId)
      const endIdx = staff.measures.findIndex((m) => m.id === endId)
      if (startIdx < 0 || endIdx < 0) continue
      return {
        staff,
        startIdx,
        endIdx,
        lo: Math.min(startIdx, endIdx),
        hi: Math.max(startIdx, endIdx),
      }
    }
  }
  return null
}

export function canExpandVoltaLeft(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  return loc != null && loc.lo > 0
}

export function canExpandVoltaRight(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  return loc != null && loc.hi < loc.staff.measures.length - 1
}

/** 左扩：把左边界移到前一小节（改写对应的 startId / endId） */
export function expandVoltaLeft(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  if (!loc || loc.lo <= 0) return false
  const nextId = loc.staff.measures[loc.lo - 1]!.id
  if (loc.startIdx === loc.lo) volta.startId = nextId
  else volta.endId = nextId
  return true
}

/** 右扩：把右边界移到后一小节 */
export function expandVoltaRight(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  if (!loc || loc.hi >= loc.staff.measures.length - 1) return false
  const nextId = loc.staff.measures[loc.hi + 1]!.id
  if (loc.endIdx === loc.hi) volta.endId = nextId
  else volta.startId = nextId
  return true
}

/** 仅覆盖一小节时不可再缩 */
export function canShrinkVolta(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  return loc != null && loc.lo < loc.hi
}

/** 左缩：左边界右移一小节 */
export function shrinkVoltaLeft(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  if (!loc || loc.lo >= loc.hi) return false
  const nextId = loc.staff.measures[loc.lo + 1]!.id
  if (loc.startIdx === loc.lo) volta.startId = nextId
  else volta.endId = nextId
  return true
}

/** 右缩：右边界左移一小节 */
export function shrinkVoltaRight(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol,
): boolean {
  const loc = locateVoltaOnStaff(musicScore, volta)
  if (!loc || loc.lo >= loc.hi) return false
  const nextId = loc.staff.measures[loc.hi - 1]!.id
  if (loc.endIdx === loc.hi) volta.endId = nextId
  else volta.startId = nextId
  return true
}
