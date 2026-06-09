import type { VDom } from 'deciphony-renderer'
import { NOTE_PART_TAGS } from '@renderer/dr-extensions/dr-play-highlight/constants'
import type { PlayHighlightProgressData } from '@renderer/dr-extensions/dr-play-highlight'

export type ScoreScrollToPlayingNoteDeps = {
  getScrollContainer: () => HTMLElement | null
  getVDomList: () => readonly VDom[]
  findElementByVDom: (node: VDom) => SVGElement | null
}

function findNotePartVDoms(vDomList: readonly VDom[], noteId: string): VDom[] {
  return vDomList.filter((node) => node.targetId === noteId && NOTE_PART_TAGS.has(node.tag))
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

/** 曲谱区域：将指定音符水平滚动到容器中央 */
export function createScoreScrollToPlayingNote(deps: ScoreScrollToPlayingNoteDeps) {
  function scrollToHorizontalCenter(noteId: string) {
    const id = noteId.trim()
    if (!id) return

    const container = deps.getScrollContainer()
    if (!container) return

    const bounds = getNoteBounds(deps.getVDomList(), id, deps.findElementByVDom)
    if (!bounds) return

    const containerRect = container.getBoundingClientRect()
    const noteCenterX = bounds.left + bounds.width / 2
    const containerCenterX = containerRect.left + containerRect.width / 2
    const targetLeft = container.scrollLeft + (noteCenterX - containerCenterX)
    container.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }

  function resetScroll() {
    const container = deps.getScrollContainer()
    if (!container) return
    container.scrollTo({ left: 0, behavior: 'smooth' })
  }

  function handleProgressStart(data: PlayHighlightProgressData) {
    if (!data.start) return
    const noteId = data.note_id?.trim()
    if (!noteId) return
    scrollToHorizontalCenter(noteId)
  }

  return { handleProgressStart, scrollToHorizontalCenter, resetScroll }
}
