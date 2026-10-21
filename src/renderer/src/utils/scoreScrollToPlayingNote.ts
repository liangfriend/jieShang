import type { MusicScore, VDom } from '@deciphony/renderer'
import { getMeasureSlots } from '@deciphony/renderer'
import { NOTE_PART_TAGS } from '@deciphony/extensions/dr-play-highlight'
import type { PlayHighlightProgressData } from '@deciphony/extensions/dr-play-highlight'
import {
  locateNotesInfoById,
  locateNotesNumberInfoById,
  locateTabNoteInfoById
} from '@deciphony/extensions/dr-edit/score-builder'

export type ScoreScrollToPlayingNoteDeps = {
  getScrollContainer: () => HTMLElement | null
  getVDomList: () => readonly VDom[]
  findElementByVDom: (node: VDom) => SVGElement | null
  /** 用于由 note_id 解析当前复谱表 */
  getMusicScore?: () => MusicScore | null | undefined
}

/** Tab 琶音/扫弦多弦播放会用 `infoId:region`；跟滚/定位取主 id */
export function stripPlayNoteIdSuffix(noteId: string): string {
  const id = noteId.trim()
  const colon = id.indexOf(':')
  return colon >= 0 ? id.slice(0, colon) : id
}

function findNotePartVDoms(vDomList: readonly VDom[], noteId: string): VDom[] {
  const baseId = stripPlayNoteIdSuffix(noteId)
  return vDomList.filter(
    (node) =>
      NOTE_PART_TAGS.has(node.tag) &&
      (node.targetId === noteId || node.targetId === baseId)
  )
}

function getNoteBounds(
  vDomList: readonly VDom[],
  noteId: string,
  findElementByVDom: (node: VDom) => SVGElement | null
): DOMRect | null {
  for (const vdom of findNotePartVDoms(vDomList, noteId)) {
    const el = findElementByVDom(vdom)
    if (el) return el.getBoundingClientRect()
  }
  return null
}

function findGrandStaffVDom(vDomList: readonly VDom[], grandStaffId: string): VDom | undefined {
  const byTarget = vDomList.find(
    (node) => node.targetId === `g-${grandStaffId}` || node.targetId === grandStaffId
  )
  if (byTarget) return byTarget
  return vDomList.find(
    (node) => node.slotData?.grandStaff?.id === grandStaffId && node.tag === 'grandStaff'
  )
}

/** 复谱表各单谱表小节行的纵向范围（不含复谱表外边距与插槽） */
function getGrandStaffMeasureRowBounds(
  score: MusicScore,
  grandStaffId: string,
  vDomList: readonly VDom[],
  findElementByVDom: (node: VDom) => SVGElement | null
): { top: number; bottom: number } | null {
  const gs = score.grandStaffs?.find((g) => g.id === grandStaffId)
  if (!gs) return null
  const ids = new Set<string>()
  for (const staff of gs.staves ?? []) {
    const first = staff.measures?.[0]
    if (first) ids.add(first.id)
  }
  let top = Infinity
  let bottom = -Infinity
  for (const node of vDomList) {
    if (node.tag !== 'measure' || !ids.has(node.targetId)) continue
    const el = findElementByVDom(node)
    if (!el) continue
    const b = el.getBoundingClientRect()
    top = Math.min(top, b.top)
    bottom = Math.max(bottom, b.bottom)
  }
  return top < bottom ? { top, bottom } : null
}

/** note_id → 复谱表 id（NotesInfo / NotesNumberInfo / TabNoteInfo / 槽位 id） */
export function resolvePlayingGrandStaffId(
  score: MusicScore,
  noteId: string,
  vDomList?: readonly VDom[]
): string | null {
  const id = stripPlayNoteIdSuffix(noteId)
  if (!id) return null

  const staffInfo = locateNotesInfoById(score, id)
  if (staffInfo) return staffInfo.grandStaff.id

  const numberInfo = locateNotesNumberInfoById(score, id)
  if (numberInfo) return numberInfo.grandStaff.id

  const tabInfo = locateTabNoteInfoById(score, id)
  if (tabInfo) return tabInfo.grandStaff.id

  for (const gs of score.grandStaffs ?? []) {
    for (const staff of gs.staves ?? []) {
      for (const measure of staff.measures ?? []) {
        for (const slot of measure.notes ? getMeasureSlots(measure) : []) {
          if (slot.id === id) return gs.id
          const symbol = slot.symbol as unknown as {
            id?: string
            notesInfo?: Array<{ id: string }>
            graceNotes?: Array<{ id: string }>
            graceNotesAfter?: Array<{ id: string }>
          }
          if (symbol.id === id) return gs.id
          const parts = [
            ...(symbol.notesInfo ?? []),
            ...(symbol.graceNotes ?? []),
            ...(symbol.graceNotesAfter ?? [])
          ]
          if (parts.some((part) => part.id === id)) return gs.id
        }
      }
    }
  }

  if (vDomList) {
    for (const node of findNotePartVDoms(vDomList, id)) {
      const gsId = node.slotData?.grandStaff?.id
      if (gsId) return gsId
    }
  }
  return null
}

/**
 * 曲谱跟滚：
 * - 音符水平滚到容器中央
 * - 当前复谱表变化时，将该复谱表（或音符）垂直滚到容器中央
 */
export function createScoreScrollToPlayingNote(deps: ScoreScrollToPlayingNoteDeps) {
  let lastGrandStaffId = ''
  /** 同一复谱表内后续音符沿用该 top，避免读到平滑滚动中途的 scrollTop 把垂直动画打断 */
  let lastTargetTop: number | null = null

  function scrollToHorizontalCenter(noteId: string) {
    followPlayingNote(noteId, { verticalOnGrandStaffChange: false })
  }

  function scrollGrandStaffToVerticalCenter(grandStaffId: string) {
    const container = deps.getScrollContainer()
    if (!container) return

    const vdom = findGrandStaffVDom(deps.getVDomList(), grandStaffId)
    if (!vdom) return
    const el = deps.findElementByVDom(vdom)
    if (!el) return

    const bounds = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const centerY = bounds.top + bounds.height / 2
    const containerCenterY = containerRect.top + containerRect.height / 2
    const targetTop = container.scrollTop + (centerY - containerCenterY)
    container.scrollTo({ top: targetTop, behavior: 'smooth' })
  }

  /**
   * 跟当前播放音符。
   * @param options.verticalOnGrandStaffChange 默认 true：复谱表变了才垂直跟滚
   */
  function followPlayingNote(
    noteId: string,
    options?: { verticalOnGrandStaffChange?: boolean }
  ) {
    const id = noteId.trim()
    if (!id) return

    const container = deps.getScrollContainer()
    if (!container) return

    const list = deps.getVDomList()
    const noteBounds = getNoteBounds(list, id, deps.findElementByVDom)
    if (!noteBounds) return

    const containerRect = container.getBoundingClientRect()
    const noteCenterX = noteBounds.left + noteBounds.width / 2
    const containerCenterX = containerRect.left + containerRect.width / 2
    const targetLeft = container.scrollLeft + (noteCenterX - containerCenterX)

    let targetTop: number | undefined
    const doVertical = options?.verticalOnGrandStaffChange !== false
    if (doVertical) {
      const score = deps.getMusicScore?.()
      const gsId = score ? resolvePlayingGrandStaffId(score, id, list) : null
      if (gsId && gsId !== lastGrandStaffId) {
        lastGrandStaffId = gsId
        const row = getGrandStaffMeasureRowBounds(score!, gsId, list, deps.findElementByVDom)
        const gsVdom = row ? undefined : findGrandStaffVDom(list, gsId)
        const gsEl = gsVdom ? deps.findElementByVDom(gsVdom) : null
        if (row) {
          targetTop =
            container.scrollTop +
            ((row.top + row.bottom) / 2 - (containerRect.top + containerRect.height / 2))
        } else if (gsEl) {
          const b = gsEl.getBoundingClientRect()
          targetTop =
            container.scrollTop +
            (b.top + b.height / 2 - (containerRect.top + containerRect.height / 2))
        } else {
          targetTop =
            container.scrollTop +
            (noteBounds.top +
              noteBounds.height / 2 -
              (containerRect.top + containerRect.height / 2))
        }
        const maxTop = container.scrollHeight - container.clientHeight
        targetTop = Math.max(0, Math.min(maxTop, targetTop))
        lastTargetTop = targetTop
      } else if (gsId && lastTargetTop != null) {
        targetTop = lastTargetTop
      }
    }

    container.scrollTo({
      left: targetLeft,
      top: targetTop ?? container.scrollTop,
      behavior: 'smooth'
    })
  }

  function resetScroll() {
    lastGrandStaffId = ''
    lastTargetTop = null
    const container = deps.getScrollContainer()
    if (!container) return
    container.scrollTo({ left: 0, top: 0, behavior: 'smooth' })
  }

  function handleProgressStart(data: PlayHighlightProgressData) {
    if (!data.start) return
    const noteId = data.note_id?.trim()
    if (!noteId) return
    followPlayingNote(noteId)
  }

  return {
    handleProgressStart,
    followPlayingNote,
    scrollToHorizontalCenter,
    scrollGrandStaffToVerticalCenter,
    resetScroll
  }
}

export type ScoreScrollFollowApi = ReturnType<typeof createScoreScrollToPlayingNote>
