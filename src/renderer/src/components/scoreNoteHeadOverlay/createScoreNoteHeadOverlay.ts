import type { VDom } from 'deciphony-renderer'
import type { NoteScoreResult } from '@renderer/types/types'
import { drawNoteHeadMarker } from './drawNoteHeadMarker'
import { buildNoteHeadGeometryIndex } from './noteHeadGeometry'
import type {
  BeginnerNoteProgressState,
  NoteHeadMarkerStyle,
  ScoreNoteHeadOverlayApi
} from './types'

export type CreateScoreNoteHeadOverlayDeps = {
  getCanvas: () => HTMLCanvasElement | null
  getWidth: () => number
  getHeight: () => number
  findElementByVDom?: (node: VDom) => SVGElement | null
}

function normalizeNoteId(noteId: unknown): string | null {
  if (noteId == null) return null
  const id = String(noteId).trim()
  return id || null
}

function resolveMarkerStyle(
  noteId: string,
  playActive: ReadonlySet<string>,
  results: ReadonlyMap<string, NoteScoreResult>,
  beginner: ReadonlyMap<string, BeginnerNoteProgressState>,
  resultsVisible: boolean
): NoteHeadMarkerStyle | null {
  if (playActive.has(noteId)) return { kind: 'play' }
  if (resultsVisible && results.has(noteId)) {
    return { kind: 'result', result: results.get(noteId) }
  }
  if (beginner.has(noteId)) {
    return { kind: 'beginner', beginnerState: beginner.get(noteId) }
  }
  return null
}

export function createScoreNoteHeadOverlay(
  deps: CreateScoreNoteHeadOverlayDeps
): ScoreNoteHeadOverlayApi {
  let geometryIndex = new Map<string, import('./types').NoteHeadGeometry>()
  const playActive = new Set<string>()
  const results = new Map<string, NoteScoreResult>()
  const beginner = new Map<string, BeginnerNoteProgressState>()
  let resultsVisible = true
  let vDomList: readonly VDom[] = []

  function syncCanvasSize() {
    const canvas = deps.getCanvas()
    if (!canvas) return
    const width = Math.max(0, deps.getWidth())
    const height = Math.max(0, deps.getHeight())
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function redraw() {
    const canvas = deps.getCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = deps.getWidth()
    const height = deps.getHeight()
    ctx.clearRect(0, 0, width, height)

    for (const [noteId, geom] of geometryIndex) {
      const style = resolveMarkerStyle(noteId, playActive, results, beginner, resultsVisible)
      if (!style) continue
      drawNoteHeadMarker(ctx, geom, style)
    }
  }

  function rebuildGeometry() {
    geometryIndex = buildNoteHeadGeometryIndex(vDomList, deps.findElementByVDom)
    redraw()
  }

  function onRenderMusicScore(list: readonly VDom[]) {
    vDomList = list
    rebuildGeometry()
  }

  function setPlayActive(noteIdInput: unknown, active: boolean) {
    const noteId = normalizeNoteId(noteIdInput)
    if (!noteId) return
    if (active) playActive.add(noteId)
    else playActive.delete(noteId)
    redraw()
  }

  function clearPlay() {
    if (playActive.size === 0) return
    playActive.clear()
    redraw()
  }

  function setNoteResult(noteIdInput: unknown, result: NoteScoreResult | null) {
    const noteId = normalizeNoteId(noteIdInput)
    if (!noteId) return
    if (result == null) results.delete(noteId)
    else results.set(noteId, result)
    redraw()
  }

  function clearResults() {
    if (results.size === 0) return
    results.clear()
    redraw()
  }

  function setResultsVisible(visible: boolean) {
    if (resultsVisible === visible) return
    resultsVisible = visible
    redraw()
  }

  function setBeginnerState(noteIdInput: unknown, state: BeginnerNoteProgressState | null) {
    const noteId = normalizeNoteId(noteIdInput)
    if (!noteId) return
    if (state == null) beginner.delete(noteId)
    else beginner.set(noteId, state)
    redraw()
  }

  function clearBeginner() {
    if (beginner.size === 0) return
    beginner.clear()
    redraw()
  }

  function markBeginnerBatchDone(noteIds: unknown[]) {
    for (const noteId of noteIds) {
      setBeginnerState(noteId, 'done')
    }
  }

  function setBeginnerCurrentBatch(noteIds: unknown[]) {
    for (const [noteId, state] of [...beginner]) {
      if (state === 'current') beginner.delete(noteId)
    }
    for (const noteId of noteIds) {
      const id = normalizeNoteId(noteId)
      if (!id || beginner.get(id) === 'done') continue
      beginner.set(id, 'current')
    }
    redraw()
  }

  function clearAll() {
    playActive.clear()
    results.clear()
    beginner.clear()
    redraw()
  }

  function resize() {
    syncCanvasSize()
    redraw()
  }

  syncCanvasSize()

  return {
    onRenderMusicScore,
    setPlayActive,
    clearPlay,
    setNoteResult,
    clearResults,
    setResultsVisible,
    setBeginnerState,
    clearBeginner,
    markBeginnerBatchDone,
    setBeginnerCurrentBatch,
    clearAll,
    resize
  }
}
