import {
  DoubleNoteAffiliatedSymbolNameEnum,
  DoubleSlotAffiliatedSymbolNameEnum,
  guzhengLianVDomPatch,
  hairpinVDomPatch,
  isMeasureNoteVoices,
  isNoteRest,
  pedalVDomPatch,
  pitchVDomPatch,
  slotSymbol,
  slurVDomPatch,
  trillVDomPatch,
} from '@deciphony/renderer'
import type {
  DoubleNoteAffiliatedSymbol,
  DoubleSlotAffiliatedSymbol,
  Measure,
  MeasureNoteSlot,
  MusicScore,
  NoteNumber,
  SingleStaff,
  StaffSlot,
  VDom,
} from '@deciphony/renderer'
import { isNoteNumberSlot, isSlotRestLike } from '@deciphony/extensions/dr-edit/score-builder'
import { nextTick } from 'vue'
import { scoreVDomList, scoreWriteGateFor } from './scoreWriteGate'

/** 跨音符记号：连音线锚定音符头（notesInfo.id），踏板 / 八度 / 颤音线 / 渐强渐弱锚定音符列（slot.id） */
export type SpanSymbol = DoubleNoteAffiliatedSymbol | DoubleSlotAffiliatedSymbol

type SpanInfo = { id: string; region?: number }

type SpanEntry = {
  slotId: string
  /** 休止符为 null */
  infos: SpanInfo[] | null
}

type SpanTrack = {
  entries: SpanEntry[]
  startIdx: number
  endIdx: number
  byInfo: boolean
}

function isSlurSymbol(sym: SpanSymbol): sym is DoubleNoteAffiliatedSymbol {
  return sym.name === DoubleNoteAffiliatedSymbolNameEnum.Slur
}

function slotInfos(slot: MeasureNoteSlot): SpanInfo[] | null {
  const body = slotSymbol(slot)
  if (isNoteRest(body as StaffSlot)) return null
  if (isNoteNumberSlot(body as StaffSlot | NoteNumber) && isSlotRestLike(body as StaffSlot | NoteNumber)) {
    return null
  }
  const infos = (body as { notesInfo?: SpanInfo[] }).notesInfo
  return Array.isArray(infos) && infos.length > 0 ? infos : null
}

/** 单谱表按声部拆成连续音符列；鼓谱上下声部各成一轨 */
function staffTracks(staff: SingleStaff): MeasureNoteSlot[][] {
  const hasVoices = staff.measures.some((m: Measure) => isMeasureNoteVoices(m.notes))
  if (!hasVoices) {
    return [staff.measures.flatMap((m) => m.notes as MeasureNoteSlot[])]
  }
  return (['up', 'down'] as const).map((voice) =>
    staff.measures.flatMap((m) => {
      const notes = m.notes
      return isMeasureNoteVoices(notes) ? notes[voice] ?? [] : notes
    }),
  )
}

function locateSpan(musicScore: MusicScore, sym: SpanSymbol): SpanTrack | null {
  const byInfo = isSlurSymbol(sym)
  const matches = (entry: SpanEntry, id: string) =>
    byInfo ? entry.infos?.some((info) => info.id === id) ?? false : entry.slotId === id
  for (const grandStaff of musicScore.grandStaffs) {
    for (const staff of grandStaff.staves) {
      for (const slots of staffTracks(staff)) {
        const entries = slots.map((slot) => ({ slotId: slot.id, infos: slotInfos(slot) }))
        const startIdx = entries.findIndex((e) => matches(e, sym.startId))
        if (startIdx < 0) continue
        const endIdx = entries.findIndex((e) => matches(e, sym.endId))
        if (endIdx < 0) continue
        return { entries, startIdx, endIdx, byInfo }
      }
    }
  }
  return null
}

/** 连音线换锚点时保持同一弦（TAB / 鼓谱用 region）或和弦内同一序号 */
function pickInfo(entry: SpanEntry, currentId: string, current: SpanEntry): SpanInfo | null {
  const infos = entry.infos
  if (!infos) return null
  const prevIndex = current.infos?.findIndex((info) => info.id === currentId) ?? -1
  const prev = prevIndex >= 0 ? current.infos![prevIndex]! : null
  if (prev?.region != null) {
    const sameRegion = infos.find((info) => info.region === prev.region)
    if (sameRegion) return sameRegion
  }
  return infos[Math.min(Math.max(prevIndex, 0), infos.length - 1)] ?? null
}

/**
 * 从 from 往 step 方向找下一个可用锚点下标。
 * 音符列：相邻任意列；连音线：相邻音符，遇休止符即停（扩）或跳过（缩，范围内）。
 */
function neighborIndex(track: SpanTrack, from: number, step: 1 | -1, skipRests: boolean): number {
  let i = from + step
  while (i >= 0 && i < track.entries.length) {
    if (!track.byInfo || track.entries[i]!.infos) return i
    if (!skipRests) return -1
    i += step
  }
  return -1
}

type Edge = 'start' | 'end'

function moveEdge(sym: SpanSymbol, track: SpanTrack, edge: Edge, targetIdx: number): boolean {
  const currentIdx = edge === 'start' ? track.startIdx : track.endIdx
  const currentId = edge === 'start' ? sym.startId : sym.endId
  const target = track.entries[targetIdx]!
  let nextId: string
  if (track.byInfo) {
    const info = pickInfo(target, currentId, track.entries[currentIdx]!)
    if (!info) return false
    nextId = info.id
  } else {
    nextId = target.slotId
  }
  if (edge === 'start') sym.startId = nextId
  else sym.endId = nextId
  return true
}

function leftIdx(track: SpanTrack) {
  return Math.min(track.startIdx, track.endIdx)
}

function rightIdx(track: SpanTrack) {
  return Math.max(track.startIdx, track.endIdx)
}

function leftEdge(track: SpanTrack): Edge {
  return track.startIdx <= track.endIdx ? 'start' : 'end'
}

function rightEdge(track: SpanTrack): Edge {
  return track.startIdx <= track.endIdx ? 'end' : 'start'
}

function expandLeftTarget(track: SpanTrack): number {
  return neighborIndex(track, leftIdx(track), -1, false)
}

function expandRightTarget(track: SpanTrack): number {
  return neighborIndex(track, rightIdx(track), 1, false)
}

/** 连音线起止必须是不同音符；音符列允许起止同列 */
function shrinkLeftTarget(track: SpanTrack): number {
  const idx = neighborIndex(track, leftIdx(track), 1, true)
  if (idx < 0) return -1
  return track.byInfo ? (idx < rightIdx(track) ? idx : -1) : idx <= rightIdx(track) ? idx : -1
}

function shrinkRightTarget(track: SpanTrack): number {
  const idx = neighborIndex(track, rightIdx(track), -1, true)
  if (idx < 0) return -1
  return track.byInfo ? (idx > leftIdx(track) ? idx : -1) : idx >= leftIdx(track) ? idx : -1
}

export type SpanResizeState = {
  canExpandLeft: boolean
  canExpandRight: boolean
  canShrinkLeft: boolean
  canShrinkRight: boolean
}

export function getSpanResizeState(musicScore: MusicScore, sym: SpanSymbol): SpanResizeState {
  const track = locateSpan(musicScore, sym)
  if (!track) {
    return { canExpandLeft: false, canExpandRight: false, canShrinkLeft: false, canShrinkRight: false }
  }
  return {
    canExpandLeft: expandLeftTarget(track) >= 0,
    canExpandRight: expandRightTarget(track) >= 0,
    canShrinkLeft: shrinkLeftTarget(track) >= 0,
    canShrinkRight: shrinkRightTarget(track) >= 0,
  }
}

export function expandSpanLeft(musicScore: MusicScore, sym: SpanSymbol): boolean {
  const track = locateSpan(musicScore, sym)
  if (!track) return false
  const idx = expandLeftTarget(track)
  return idx >= 0 && moveEdge(sym, track, leftEdge(track), idx)
}

export function expandSpanRight(musicScore: MusicScore, sym: SpanSymbol): boolean {
  const track = locateSpan(musicScore, sym)
  if (!track) return false
  const idx = expandRightTarget(track)
  return idx >= 0 && moveEdge(sym, track, rightEdge(track), idx)
}

export function shrinkSpanLeft(musicScore: MusicScore, sym: SpanSymbol): boolean {
  const track = locateSpan(musicScore, sym)
  if (!track) return false
  const idx = shrinkLeftTarget(track)
  return idx >= 0 && moveEdge(sym, track, leftEdge(track), idx)
}

export function shrinkSpanRight(musicScore: MusicScore, sym: SpanSymbol): boolean {
  const track = locateSpan(musicScore, sym)
  if (!track) return false
  const idx = shrinkRightTarget(track)
  return idx >= 0 && moveEdge(sym, track, rightEdge(track), idx)
}

type RelativePoint = { x: number; y: number }

type GeomGroup = Record<string, unknown> & {
  relativeStartPoint?: RelativePoint
  relativeEndPoint?: RelativePoint
  relativeControlPoint?: RelativePoint
}

function geomGroupOf(sym: SpanSymbol): GeomGroup | null {
  const data = sym.data as Record<string, GeomGroup | undefined> | undefined
  if (!data) return null
  return (
    data.slur ??
    data.pedal ??
    data.pitch ??
    data.trill ??
    data.hairpin ??
    data.guzhengLian ??
    null
  )
}

function liveGeomOf(sym: SpanSymbol, live: VDom): GeomGroup | null {
  const special = live.special
  if (!special) return null
  if (sym.name === DoubleNoteAffiliatedSymbolNameEnum.Slur) return (special.slur as GeomGroup) ?? null
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pedal) return (special.pedal as GeomGroup) ?? null
  if (
    sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_up ||
    sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_down
  ) {
    return (special.pitch as GeomGroup) ?? null
  }
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Trill_line) return (special.trill as GeomGroup) ?? null
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Hairpin) return (special.hairpin as GeomGroup) ?? null
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Guzheng_lian) {
    return (special.guzhengLian as GeomGroup) ?? null
  }
  return null
}

/** 屏上最后一笔带这条几何的节点（全局层画在行层后面） */
function findLiveGeomNode(musicScore: MusicScore, sym: SpanSymbol): VDom | undefined {
  const list = scoreVDomList(musicScore)
  for (let i = list.length - 1; i >= 0; i--) {
    const node = list[i]
    if (node?.targetId === sym.id && liveGeomOf(sym, node)) return node
  }
  return undefined
}

/**
 * startPoint 里已经含着相对偏移。屏上 special 和源数据可能不是同一份：
 * 哪边的分量非 0，减掉的就是哪边（拖拽写在 special 上，属性栏写在 data 上）。
 */
function bakedCoord(liveV?: number, dataV?: number): number {
  const live = liveV ?? 0
  return live !== 0 ? live : (dataV ?? 0)
}

function bakedPoint(livePt: RelativePoint | undefined, dataPt: RelativePoint | undefined): RelativePoint {
  return {
    x: bakedCoord(livePt?.x, dataPt?.x),
    y: bakedCoord(livePt?.y, dataPt?.y),
  }
}

function zeroPt(): RelativePoint {
  return { x: 0, y: 0 }
}

/**
 * 相对当前端点算「relative 全部归零」补丁（与 deciphony-test resetSlurRelativeOffset 一致）。
 * 起止 / 控制点的 x、y 都清零，恢复默认锚点位置。
 */
function resetAlignPatch(sym: SpanSymbol, live: VDom, data: GeomGroup): Partial<VDom> | null {
  const shown = liveGeomOf(sym, live)
  if (!shown) return null
  const oldStart = bakedPoint(shown.relativeStartPoint, data.relativeStartPoint)
  const oldEnd = bakedPoint(shown.relativeEndPoint, data.relativeEndPoint)
  const oldControl = bakedPoint(shown.relativeControlPoint, data.relativeControlPoint)
  if (sym.name === DoubleNoteAffiliatedSymbolNameEnum.Slur && live.special?.slur) {
    const basis: VDom = {
      ...live,
      special: {
        ...live.special,
        slur: {
          ...live.special.slur,
          relativeStartPoint: oldStart,
          relativeEndPoint: oldEnd,
          relativeControlPoint: oldControl,
        },
      },
    }
    return slurVDomPatch(basis, {
      ...live.special.slur,
      relativeStartPoint: zeroPt(),
      relativeEndPoint: zeroPt(),
      relativeControlPoint: zeroPt(),
    })
  }
  const nextEnds = { relativeStartPoint: zeroPt(), relativeEndPoint: zeroPt() }
  const prevEnds = { relativeStartPoint: oldStart, relativeEndPoint: oldEnd }
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pedal && live.special?.pedal) {
    const basis: VDom = {
      ...live,
      special: { ...live.special, pedal: { ...live.special.pedal, ...prevEnds } },
    }
    return pedalVDomPatch(basis, { ...live.special.pedal, ...nextEnds })
  }
  if (
    (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_up ||
      sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_down) &&
    live.special?.pitch
  ) {
    const basis: VDom = {
      ...live,
      special: { ...live.special, pitch: { ...live.special.pitch, ...prevEnds } },
    }
    return pitchVDomPatch(basis, { ...live.special.pitch, ...nextEnds })
  }
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Trill_line && live.special?.trill) {
    const basis: VDom = {
      ...live,
      special: { ...live.special, trill: { ...live.special.trill, ...prevEnds } },
    }
    return trillVDomPatch(basis, { ...live.special.trill, ...nextEnds })
  }
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Hairpin && live.special?.hairpin) {
    const basis: VDom = {
      ...live,
      special: { ...live.special, hairpin: { ...live.special.hairpin, ...prevEnds } },
    }
    return hairpinVDomPatch(basis, { ...live.special.hairpin, ...nextEnds })
  }
  if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Guzheng_lian && live.special?.guzhengLian) {
    const basis: VDom = {
      ...live,
      special: { ...live.special, guzhengLian: { ...live.special.guzhengLian, ...prevEnds } },
    }
    return guzhengLianVDomPatch(basis, { ...live.special.guzhengLian, ...nextEnds })
  }
  return null
}

/** 把起止和控制点的 relative 偏移写成 0（含垂直） */
function zeroRelativeOffset(group: GeomGroup) {
  if (group.relativeStartPoint) {
    group.relativeStartPoint.x = 0
    group.relativeStartPoint.y = 0
  }
  if (group.relativeEndPoint) {
    group.relativeEndPoint.x = 0
    group.relativeEndPoint.y = 0
  }
  if (group.relativeControlPoint) {
    group.relativeControlPoint.x = 0
    group.relativeControlPoint.y = 0
  }
}

/** 重置对齐：起止 / 控制点 relative 全部清零，立刻 updateVDom，再落盘 */
export function resetSpanHorizontalOffset(musicScore: MusicScore, sym: SpanSymbol): void {
  const group = geomGroupOf(sym)
  if (!group) return

  const live = findLiveGeomNode(musicScore, sym)
  const patch = live ? resetAlignPatch(sym, live, group) : null
  if (patch) {
    scoreWriteGateFor(musicScore).patch({
      key: `span:${sym.id}:resetAlign`,
      delay: 0,
      mirror: { targetId: sym.id, patch },
      commit: () => {},
    })
  }
  // 拖拽能马上改视图，是因为 data 晚一拍才落盘。这里同样先 updateVDom，
  // 等这帧画完再把 relative* 写成 0。同一拍写数据会重排全局层，
  // 把节点换回组件已经持有的那个对象，弧线不会重算。
  nextTick(() => zeroRelativeOffset(group))
}
