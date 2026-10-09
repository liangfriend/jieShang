import type { VDom } from '@deciphony/renderer'
import type { NoteScoreResult } from '@renderer/types/types'
import { drawNoteHeadMarker } from './drawNoteHeadMarker'
import { buildNoteHeadGeometryIndex } from './noteHeadGeometry'
import type {
  BeginnerNoteProgressState,
  NoteHeadMarkerStyle,
  ScoreNoteHeadOverlayApi
} from './types'

type Rect = { x: number; y: number; w: number; h: number }

export type CreateScoreNoteHeadOverlayDeps = {
  getCanvas: () => HTMLCanvasElement | null
  getWidth: () => number
  getHeight: () => number
  findElementByVDom?: (node: VDom) => SVGElement | null
  /** 可视区域（曲谱坐标）；单行长谱宽度可达数万像素，画布只覆盖视口附近，避免超出 canvas 尺寸上限 */
  getViewport?: () => Rect | null
}

/** 描边线宽的外扩余量 */
const OUTLINE_PAD = 4
/** 画布在视口左右各多覆盖的宽度（倍视口宽），滚出这段才重新定位 */
const VIEWPORT_MARGIN_RATIO = 1

function normalizeNoteId(noteId: unknown): string | null {
  if (noteId == null) return null
  let id = String(noteId).trim()
  if (!id) return null
  // Tab 多弦播放 id 形如 infoId:region
  const colon = id.indexOf(':')
  if (colon >= 0) id = id.slice(0, colon)
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
  /** 画布覆盖范围（曲谱坐标）：简谱叠音等会画到曲谱标称尺寸之外，画布需随之外扩 */
  let bounds: Rect = { x: 0, y: 0, w: 0, h: 0 }
  /** 画布实际覆盖范围：bounds 与视口（含外扩）的交集 */
  let area: Rect = { x: 0, y: 0, w: 0, h: 0 }

  function computeArea(): Rect {
    const vp = deps.getViewport?.()
    if (!vp || vp.w <= 0) return bounds
    const margin = vp.w * VIEWPORT_MARGIN_RATIO
    const x0 = Math.max(bounds.x, Math.floor(vp.x - margin))
    const x1 = Math.min(bounds.x + bounds.w, Math.ceil(vp.x + vp.w + margin))
    if (x1 <= x0) return { x: bounds.x, y: bounds.y, w: 0, h: bounds.h }
    return { x: x0, y: bounds.y, w: x1 - x0, h: bounds.h }
  }

  function computeBounds() {
    let minX = 0
    let minY = 0
    let maxX = Math.max(0, deps.getWidth())
    let maxY = Math.max(0, deps.getHeight())
    for (const g of geometryIndex.values()) {
      minX = Math.min(minX, g.x - OUTLINE_PAD)
      minY = Math.min(minY, g.y - OUTLINE_PAD)
      maxX = Math.max(maxX, g.x + g.w + OUTLINE_PAD)
      maxY = Math.max(maxY, g.y + g.h + OUTLINE_PAD)
    }
    bounds = { x: Math.floor(minX), y: Math.floor(minY), w: Math.ceil(maxX - minX), h: Math.ceil(maxY - minY) }
  }

  function syncCanvasSize() {
    const canvas = deps.getCanvas()
    if (!canvas) return
    computeBounds()
    area = computeArea()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(area.w * dpr)
    canvas.height = Math.round(area.h * dpr)
    canvas.style.left = `${area.x}px`
    canvas.style.top = `${area.y}px`
    canvas.style.width = `${area.w}px`
    canvas.style.height = `${area.h}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, -area.x * dpr, -area.y * dpr)
  }

  function redraw() {
    const canvas = deps.getCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(area.x, area.y, area.w, area.h)
    const right = area.x + area.w

    for (const [noteId, geom] of geometryIndex) {
      if (geom.x + geom.w + OUTLINE_PAD < area.x || geom.x - OUTLINE_PAD > right) continue
      const style = resolveMarkerStyle(noteId, playActive, results, beginner, resultsVisible)
      if (!style) continue
      drawNoteHeadMarker(ctx, geom, style)
    }
  }

  /** 滚动后：视口仍在画布覆盖范围内就不动，滚出才重新定位并重画 */
  function onViewportChange() {
    const vp = deps.getViewport?.()
    if (!vp) return
    const buffer = vp.w * 0.25
    const leftOk = area.x <= bounds.x || vp.x - area.x >= buffer
    const rightOk =
      area.x + area.w >= bounds.x + bounds.w || area.x + area.w - (vp.x + vp.w) >= buffer
    if (leftOk && rightOk) return
    syncCanvasSize()
    redraw()
  }

  function rebuildGeometry() {
    geometryIndex = buildNoteHeadGeometryIndex(vDomList, deps.findElementByVDom)
    syncCanvasSize()
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
    resize,
    onViewportChange
  }
}
