/**
 * 单谱表 / 复谱表剪贴板：连同小节结构（小节线、谱号、调号、拍号、反复、小节数量）整体复制，
 * 粘贴时替换目标谱表；两端都在被复制范围内的曲谱级附属（连音线、volta 等）一并带过去。
 */
import type { GrandStaff, MusicScore, MusicScoreTypeEnum, SingleStaff } from '@deciphony/renderer'
import { addMeasure } from '@deciphony/extensions/dr-edit'
import { newId } from '@deciphony/extensions/dr-edit/score-builder'
import { toRaw } from 'vue'

type ScoreAffiliated = MusicScore['affiliatedSymbols'][number]

type StaffClipboard = {
  notationType: MusicScoreTypeEnum
  staff: SingleStaff
  affiliated: ScoreAffiliated[]
}

type GrandStaffClipboard = {
  notationType: MusicScoreTypeEnum
  grandStaff: GrandStaff
  affiliated: ScoreAffiliated[]
}

/** 编辑会话内剪贴板；存原始快照，每次粘贴再生成新 id */
let staffClipboard: StaffClipboard | null = null
let grandStaffClipboard: GrandStaffClipboard | null = null

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

function collectIds(value: unknown, ids: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (typeof record.id === 'string') ids.add(record.id)
  for (const key of Object.keys(record)) collectIds(record[key], ids)
}

function assignFreshIds(value: unknown, idMap: Map<string, string>) {
  if (Array.isArray(value)) {
    for (const item of value) assignFreshIds(item, idMap)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (typeof record.id === 'string') {
    const next = newId()
    idMap.set(record.id, next)
    record.id = next
  }
  for (const key of Object.keys(record)) assignFreshIds(record[key], idMap)
}

/** startId / endId 等引用字段改指向新 id */
function remapIdRefs(value: unknown, idMap: Map<string, string>) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      if (typeof item === 'string' && idMap.has(item)) value[i] = idMap.get(item)
      else remapIdRefs(item, idMap)
    }
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  for (const key of Object.keys(record)) {
    const item = record[key]
    if (key !== 'id' && typeof item === 'string' && idMap.has(item)) record[key] = idMap.get(item)
    else remapIdRefs(item, idMap)
  }
}

function cloneWithFreshIds<T>(host: T, affiliated: ScoreAffiliated[]) {
  const nextHost = deepClone(host)
  const nextAffiliated = deepClone(affiliated)
  const idMap = new Map<string, string>()
  assignFreshIds(nextHost, idMap)
  assignFreshIds(nextAffiliated, idMap)
  remapIdRefs(nextHost, idMap)
  remapIdRefs(nextAffiliated, idMap)
  return { host: nextHost, affiliated: nextAffiliated }
}

function affiliatedInside(musicScore: MusicScore, host: unknown): ScoreAffiliated[] {
  const ids = new Set<string>()
  collectIds(host, ids)
  return musicScore.affiliatedSymbols.filter((sym) => ids.has(sym.startId) && ids.has(sym.endId))
}

/** 删除任一端锚在 host 内的曲谱级附属 */
function purgeAffiliatedTouching(musicScore: MusicScore, host: unknown) {
  const ids = new Set<string>()
  collectIds(host, ids)
  if (!ids.size) return
  musicScore.affiliatedSymbols = musicScore.affiliatedSymbols.filter(
    (sym) => !ids.has(sym.startId) && !ids.has(sym.endId)
  )
}

/** 复谱表内各单谱表小节数对齐：短的末尾补空小节，不删任何小节 */
function alignStaffMeasureCounts(grandStaff: GrandStaff, notationType: MusicScoreTypeEnum) {
  const max = Math.max(0, ...grandStaff.staves.map((staff) => staff.measures.length))
  for (const staff of grandStaff.staves) {
    while (staff.measures.length < max) addMeasure(staff, { notationType })
  }
}

export function hasStaffClipboard(notationType: MusicScoreTypeEnum): boolean {
  return staffClipboard?.notationType === notationType
}

export function hasGrandStaffClipboard(notationType: MusicScoreTypeEnum): boolean {
  return grandStaffClipboard?.notationType === notationType
}

export function copySingleStaff(musicScore: MusicScore, staff: SingleStaff): boolean {
  staffClipboard = {
    notationType: musicScore.type,
    staff: deepClone(staff),
    affiliated: deepClone(affiliatedInside(musicScore, staff))
  }
  return true
}

export function copyGrandStaff(musicScore: MusicScore, grandStaff: GrandStaff): boolean {
  grandStaffClipboard = {
    notationType: musicScore.type,
    grandStaff: deepClone(grandStaff),
    affiliated: deepClone(affiliatedInside(musicScore, grandStaff))
  }
  return true
}

/** 用剪贴板单谱表替换 target；返回是否成功 */
export function pasteSingleStaff(
  musicScore: MusicScore,
  grandStaff: GrandStaff,
  target: SingleStaff
): boolean {
  if (!staffClipboard || staffClipboard.notationType !== musicScore.type) return false
  const index = grandStaff.staves.findIndex((staff) => staff.id === target.id)
  if (index < 0) return false

  const { host, affiliated } = cloneWithFreshIds(staffClipboard.staff, staffClipboard.affiliated)
  purgeAffiliatedTouching(musicScore, grandStaff.staves[index])
  grandStaff.staves.splice(index, 1, host)
  alignStaffMeasureCounts(grandStaff, musicScore.type)
  musicScore.affiliatedSymbols.push(...affiliated)
  return true
}

/** 用剪贴板复谱表替换 target；连谱开关沿用目标（全曲统一） */
export function pasteGrandStaff(musicScore: MusicScore, target: GrandStaff): boolean {
  if (!grandStaffClipboard || grandStaffClipboard.notationType !== musicScore.type) return false
  const index = musicScore.grandStaffs.findIndex((grandStaff) => grandStaff.id === target.id)
  if (index < 0) return false

  const { host, affiliated } = cloneWithFreshIds(
    grandStaffClipboard.grandStaff,
    grandStaffClipboard.affiliated
  )
  const current = musicScore.grandStaffs[index]!
  if (current.linkedStaff) host.linkedStaff = true
  else delete host.linkedStaff

  purgeAffiliatedTouching(musicScore, current)
  musicScore.grandStaffs.splice(index, 1, host)
  musicScore.affiliatedSymbols.push(...affiliated)
  return true
}
