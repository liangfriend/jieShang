import type {VDom} from 'deciphony-renderer'
import type {ScoreNoteHeadOverlayApi} from '@renderer/components/scoreNoteHeadOverlay'
import {NOTE_PART_TAGS, PLAY_HIGHLIGHT_CLASS} from './constants'

export type PlayHighlightTarget = VDom | string

export type PlayHighlightDeps = {
    getVDomList: () => readonly VDom[]
    findElementByVDom: (node: VDom) => SVGElement | null
    /** 练习/新手模式：用 canvas 叠层代替 filter 类名 */
    getOverlay?: () => ScoreNoteHeadOverlayApi | null
}

function normalizeNoteId(target: PlayHighlightTarget): string | null {
    if (typeof target === 'string') return target.trim() || null
    return target.targetId?.trim() || null
}

function findNotePartVDoms(vDomList: readonly VDom[], noteId: string): VDom[] {
    return vDomList.filter((node) => node.targetId === noteId && NOTE_PART_TAGS.has(node.tag))
}

function applyHighlight(el: SVGElement) {
    el.style.transition = 'filter 0.12s ease'
    el.classList.add(PLAY_HIGHLIGHT_CLASS)
}

function removeHighlight(el: SVGElement) {
    el.classList.remove(PLAY_HIGHLIGHT_CLASS)
    el.style.transition = ''
}

/**
 * 播放高亮控制器：通过 vDom → findElementByVDom（内部即 findElementByVdomDomId）定位顶层 g，加 CSS 高亮。
 */
export function createPlayHighlight(deps: PlayHighlightDeps) {
    const activeNoteIds = new Set<string>()
    const highlightedByNoteId = new Map<string, Set<SVGElement>>()

    function applyHighlightForNoteId(noteId: string) {
        const overlay = deps.getOverlay?.()
        if (overlay) {
            overlay.setPlayActive(noteId, true)
            activeNoteIds.add(noteId)
            return
        }

        const vdoms = findNotePartVDoms(deps.getVDomList(), noteId)
        const els = new Set<SVGElement>()
        for (const vdom of vdoms) {
            const el = deps.findElementByVDom(vdom)
            if (!el) continue
            applyHighlight(el)
            els.add(el)
        }
        if (els.size) highlightedByNoteId.set(noteId, els)
    }

    function removeHighlightForNoteId(noteId: string) {
        const overlay = deps.getOverlay?.()
        if (overlay) {
            overlay.setPlayActive(noteId, false)
            highlightedByNoteId.delete(noteId)
            return
        }

        const els = highlightedByNoteId.get(noteId)
        if (!els) return
        for (const el of els) removeHighlight(el)
        highlightedByNoteId.delete(noteId)
    }

    /** 取消当前所有播放高亮 */
    function clearHighlight() {
        const overlay = deps.getOverlay?.()
        if (overlay) {
            overlay.clearPlay()
            highlightedByNoteId.clear()
            activeNoteIds.clear()
            return
        }

        for (const noteId of [...highlightedByNoteId.keys()]) {
            removeHighlightForNoteId(noteId)
        }
        activeNoteIds.clear()
    }

    /** 先取消上一批，再高亮传入的一批音符（VDom 或 NotesInfo.id / note_id 字符串） */
    function highlightNotes(targets: PlayHighlightTarget[]) {
        clearHighlight()
        for (const target of targets) {
            const noteId = normalizeNoteId(target)
            if (!noteId) continue
            activeNoteIds.add(noteId)
            applyHighlightForNoteId(noteId)
        }
    }

    /** 增量高亮单个音符（和弦 / 多声部同时发声时不互相清除） */
    function addNoteHighlight(target: PlayHighlightTarget) {
        const noteId = normalizeNoteId(target)
        if (!noteId || activeNoteIds.has(noteId)) return
        activeNoteIds.add(noteId)
        applyHighlightForNoteId(noteId)
    }

    /** 取消单个音符高亮 */
    function removeNoteHighlight(target: PlayHighlightTarget) {
        const noteId = normalizeNoteId(target)
        if (!noteId) return
        activeNoteIds.delete(noteId)
        removeHighlightForNoteId(noteId)
    }

    /** vDom 重渲染后按 noteId 重新绑定 DOM 高亮 */
    function rebindAfterRender() {
        if (deps.getOverlay?.()) return

        for (const noteId of [...activeNoteIds]) {
            removeHighlightForNoteId(noteId)
            applyHighlightForNoteId(noteId)
        }
    }

    return {
        clearHighlight,
        highlightNotes,
        addNoteHighlight,
        removeNoteHighlight,
        rebindAfterRender,
        findNotePartVDoms: (noteId: string) => findNotePartVDoms(deps.getVDomList(), noteId),
    }
}
