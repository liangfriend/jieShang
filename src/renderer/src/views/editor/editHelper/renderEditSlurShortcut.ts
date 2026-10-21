/**
 * < / > / / 连音线快捷键：< 连上一个音→当前音，> 连当前音→下一个音；
 * 当前音已是连音线终点时 < 往左扩、已是起点时 > 往右扩；/ 删除当前音上的所有连音线。
 * 选中小节时取小节最后一个音，不必先点音符。跳过休止符，可跨到相邻复谱表的同下标单谱表。
 */
import {
  DoubleNoteAffiliatedSymbolNameEnum,
  isMeasureNoteVoices,
  isNoteRest,
  slotSymbol,
  type DoubleNoteAffiliatedSymbol,
  type MeasureNoteSlot,
  type MusicScore,
  type NoteNumber,
  type SlotData,
  type StaffSlot
} from '@deciphony/renderer'
import {
  createSlur,
  isNoteNumberSlot,
  isSlotRestLike,
  type DrumVoice
} from '@deciphony/extensions/dr-edit/score-builder'
import {
  DEFAULT_SLUR_THICKNESS,
  applyScoreSlurStyleToNewSlur,
  setSlurThickness,
} from './renderEditSlurProperties'

export type SlurShortcutSide = 'left' | 'right'

type TrackInfo = { id: string; region?: number }

type TrackEntry = { slot: MeasureNoteSlot; infos: TrackInfo[] }

function slotInfos(slot: MeasureNoteSlot): TrackInfo[] | null {
  const body = slotSymbol(slot)
  if (isNoteRest(body as StaffSlot)) return null
  if (isNoteNumberSlot(body as StaffSlot | NoteNumber) && isSlotRestLike(body as StaffSlot | NoteNumber)) {
    return null
  }
  const infos = (body as { notesInfo?: TrackInfo[] }).notesInfo
  return Array.isArray(infos) && infos.length > 0 ? infos : null
}

/** 选中项所在单谱表下标，在每个复谱表里取同下标单谱表，按声部连成一条音符序列（不含休止符） */
function buildTrack(selected: SlotData, voice: DrumVoice): TrackEntry[] {
  const { musicScore, grandStaff, singleStaff } = selected
  if (!grandStaff || !singleStaff) return []
  const staffIndex = grandStaff.staves.findIndex((s) => s.id === singleStaff.id)
  if (staffIndex < 0) return []
  const entries: TrackEntry[] = []
  for (const gs of musicScore.grandStaffs) {
    const staff = gs.staves[staffIndex]
    if (!staff) continue
    for (const measure of staff.measures) {
      const notes = measure.notes
      const slots = isMeasureNoteVoices(notes) ? notes[voice] ?? [] : notes
      for (const slot of slots) {
        const infos = slotInfos(slot)
        if (infos) entries.push({ slot, infos })
      }
    }
  }
  return entries
}

/** 选中音符头取该音；选中小节取小节最后一个音 */
function resolveCurrent(
  selected: SlotData,
  track: TrackEntry[],
  voice: DrumVoice
): { index: number; infoId: string } | null {
  const infoId = (selected.info as { id?: string } | null)?.id
  if (infoId) {
    const index = track.findIndex((e) => e.infos.some((info) => info.id === infoId))
    return index >= 0 ? { index, infoId } : null
  }
  const measure = selected.measure
  if (!measure || selected.self !== measure) return null
  const notes = measure.notes
  const slots = isMeasureNoteVoices(notes) ? notes[voice] ?? [] : notes
  const ids = new Set(slots.map((s) => s.id))
  for (let i = track.length - 1; i >= 0; i--) {
    if (ids.has(track[i]!.slot.id)) return { index: i, infoId: track[i]!.infos[0]!.id }
  }
  return null
}

function indexOfInfo(track: TrackEntry[], id: string): number {
  return track.findIndex((e) => e.infos.some((info) => info.id === id))
}

/** 换锚点时保持同一弦 / 鼓位（region），否则保持和弦内同一层 */
function pickInfo(target: TrackEntry, from: TrackEntry, fromId: string): TrackInfo {
  const fromIndex = from.infos.findIndex((info) => info.id === fromId)
  const prev = fromIndex >= 0 ? from.infos[fromIndex]! : null
  if (prev?.region != null) {
    const same = target.infos.find((info) => info.region === prev.region)
    if (same) return same
  }
  return target.infos[Math.min(Math.max(fromIndex, 0), target.infos.length - 1)]!
}

function isSlur(sym: { name?: unknown }): sym is DoubleNoteAffiliatedSymbol {
  return sym.name === DoubleNoteAffiliatedSymbolNameEnum.Slur
}

/**
 * } 只扩「以当前音为起点」的连音线（右端往右挪一个音），{ 只扩「以当前音为终点」的（左端往左挪）；
 * 当前音只是另一侧端点时不扩，而是新建一条长度 2 的连音线。
 */
export function applySlurShortcut(selected: SlotData | null, side: SlurShortcutSide, voice: DrumVoice): boolean {
  if (!selected) return false
  const musicScore = selected.musicScore as MusicScore
  const track = buildTrack(selected, voice)
  const current = resolveCurrent(selected, track, voice)
  if (!current) return false
  const currentEntry = track[current.index]!

  const anchored = musicScore.affiliatedSymbols
    .filter(isSlur)
    .map((sym) => ({ sym, start: indexOfInfo(track, sym.startId), end: indexOfInfo(track, sym.endId) }))
    .find(({ start, end }) => {
      if (start < 0 || end < 0) return false
      const ownEdge = side === 'right' ? Math.min(start, end) : Math.max(start, end)
      return ownEdge === current.index
    })

  if (anchored) {
    const { sym, start, end } = anchored
    const startIsLeft = start <= end
    const edgeIdx = side === 'left' ? Math.min(start, end) : Math.max(start, end)
    const target = track[edgeIdx + (side === 'left' ? -1 : 1)]
    if (!target) return false
    const moveStart = side === 'left' ? startIsLeft : !startIsLeft
    const fromId = moveStart ? sym.startId : sym.endId
    const nextId = pickInfo(target, track[edgeIdx]!, fromId).id
    if (moveStart) sym.startId = nextId
    else sym.endId = nextId
    return true
  }

  const neighbor = track[current.index + (side === 'left' ? -1 : 1)]
  if (!neighbor) return false
  const neighborId = pickInfo(neighbor, currentEntry, current.infoId).id
  const slur = createSlur(
    side === 'left'
      ? { startId: neighborId, endId: current.infoId }
      : { startId: current.infoId, endId: neighborId }
  )
  setSlurThickness(slur, DEFAULT_SLUR_THICKNESS)
  applyScoreSlurStyleToNewSlur(musicScore, slur)
  musicScore.affiliatedSymbols.push(slur)
  return true
}

/** |：删除起点或终点落在当前音上的所有连音线 */
export function removeSlursOfCurrent(selected: SlotData | null, voice: DrumVoice): boolean {
  if (!selected) return false
  const musicScore = selected.musicScore as MusicScore
  const track = buildTrack(selected, voice)
  const current = resolveCurrent(selected, track, voice)
  if (!current) return false
  const ids = new Set(track[current.index]!.infos.map((info) => info.id))
  const list = musicScore.affiliatedSymbols
  let removed = false
  for (let i = list.length - 1; i >= 0; i--) {
    const sym = list[i]!
    if (isSlur(sym) && (ids.has(sym.startId) || ids.has(sym.endId))) {
      list.splice(i, 1)
      removed = true
    }
  }
  return removed
}
