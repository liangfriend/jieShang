import type { VDom } from '@deciphony/renderer'
import { NOTE_RESULT_COLOR } from '@renderer/constant/practice'
import type { NoteScoreResult } from '@renderer/types/types'

export type BeginnerNoteProgressState = 'current' | 'done'

export type ScoreNoteFillMarkerDeps = {
  findElementByVDom: (node: VDom) => SVGElement | null
}

/** 着色的音符本体部件；附点、八度点、减时线、加线、变音记号保持原色 */
const FILL_PART_TAGS = new Set([
  'noteHead',
  'noteStem',
  'noteTail',
  'rest',
  'noteNumber',
  'tabNoteNumber',
  'longRest',
  'longRestNumber'
])

const MARK_CLASS = 'score-note-mark'
const FILL_VAR = '--score-note-mark-fill'
const PERFECT_GRADIENT_ID = 'score-note-mark-perfect'
const BEGINNER_CURRENT_COLOR = '#ff4040'
const BEGINNER_DONE_COLOR = '#15803d'

const PERFECT_GRADIENT_STOPS: Array<[number, string]> = [
  [0, '#ff3366'],
  [0.2, '#ff9933'],
  [0.4, '#ffdd00'],
  [0.6, '#33cc66'],
  [0.8, '#3399ff'],
  [1, '#a855f7']
]

/** 完美用渐变填充：渐变定义放在文档里一个隐藏 svg 中，各曲谱 svg 通过 url(#id) 引用 */
function ensurePerfectGradient() {
  if (document.getElementById(PERFECT_GRADIENT_ID)) return
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'absolute'
  const defs = document.createElementNS(ns, 'defs')
  const gradient = document.createElementNS(ns, 'linearGradient')
  gradient.id = PERFECT_GRADIENT_ID
  gradient.setAttribute('x1', '0')
  gradient.setAttribute('y1', '0')
  gradient.setAttribute('x2', '1')
  gradient.setAttribute('y2', '1')
  for (const [offset, color] of PERFECT_GRADIENT_STOPS) {
    const stop = document.createElementNS(ns, 'stop')
    stop.setAttribute('offset', String(offset))
    stop.setAttribute('stop-color', color)
    gradient.appendChild(stop)
  }
  defs.appendChild(gradient)
  svg.appendChild(defs)
  document.body.appendChild(svg)
}

function normalizeNoteId(noteId: unknown): string | null {
  if (noteId == null) return null
  let id = String(noteId).trim()
  // Tab 多弦播放 id 形如 infoId:region
  const colon = id.indexOf(':')
  if (colon >= 0) id = id.slice(0, colon)
  return id || null
}

function resultPaint(result: NoteScoreResult): string {
  if (result === 'perfect') return `url(#${PERFECT_GRADIENT_ID})`
  return NOTE_RESULT_COLOR[result]
}

/**
 * 练习评分 / 新手进度：直接给音符 SVG 部件换填充色，不用叠加 canvas。
 * 每次状态变化只改对应音符的元素；重渲染后按记录的状态重新套上。
 */
export function createScoreNoteFillMarker(deps: ScoreNoteFillMarkerDeps) {
  let partsByNoteId = new Map<string, VDom[]>()
  const marked = new Map<string, SVGElement[]>()
  const results = new Map<string, NoteScoreResult>()
  const beginner = new Map<string, BeginnerNoteProgressState>()
  let resultsVisible = true

  function resolvePaint(noteId: string): string | null {
    if (resultsVisible) {
      const result = results.get(noteId)
      if (result) return resultPaint(result)
    }
    const state = beginner.get(noteId)
    if (state === 'current') return BEGINNER_CURRENT_COLOR
    if (state === 'done') return BEGINNER_DONE_COLOR
    return null
  }

  function unmark(noteId: string) {
    const els = marked.get(noteId)
    if (!els) return
    for (const el of els) {
      el.classList.remove(MARK_CLASS)
      el.style.removeProperty(FILL_VAR)
    }
    marked.delete(noteId)
  }

  function apply(noteId: string) {
    const paint = resolvePaint(noteId)
    if (!paint) {
      unmark(noteId)
      return
    }
    let els = marked.get(noteId)
    if (!els) {
      els = []
      for (const vdom of partsByNoteId.get(noteId) ?? []) {
        const el = deps.findElementByVDom(vdom)
        if (el) els.push(el)
      }
      if (els.length === 0) return
      marked.set(noteId, els)
    }
    if (paint.startsWith('url(')) ensurePerfectGradient()
    for (const el of els) {
      el.classList.add(MARK_CLASS)
      el.style.setProperty(FILL_VAR, paint)
    }
  }

  function onRenderMusicScore(list: readonly VDom[]) {
    for (const noteId of [...marked.keys()]) unmark(noteId)
    const next = new Map<string, VDom[]>()
    for (const node of list) {
      if (!FILL_PART_TAGS.has(node.tag)) continue
      const id = normalizeNoteId(node.targetId)
      if (!id) continue
      const parts = next.get(id)
      if (parts) parts.push(node)
      else next.set(id, [node])
    }
    partsByNoteId = next
    for (const noteId of new Set([...results.keys(), ...beginner.keys()])) apply(noteId)
  }

  function setNoteResult(noteIdInput: unknown, result: NoteScoreResult | null) {
    const noteId = normalizeNoteId(noteIdInput)
    if (!noteId) return
    if (result == null) results.delete(noteId)
    else results.set(noteId, result)
    apply(noteId)
  }

  function clearResults() {
    const ids = [...results.keys()]
    results.clear()
    for (const id of ids) apply(id)
  }

  function setResultsVisible(visible: boolean) {
    if (resultsVisible === visible) return
    resultsVisible = visible
    for (const id of results.keys()) apply(id)
  }

  function clearBeginner() {
    const ids = [...beginner.keys()]
    beginner.clear()
    for (const id of ids) apply(id)
  }

  function markBeginnerBatchDone(noteIds: unknown[]) {
    for (const input of noteIds) {
      const id = normalizeNoteId(input)
      if (!id) continue
      beginner.set(id, 'done')
      apply(id)
    }
  }

  function setBeginnerCurrentBatch(noteIds: unknown[]) {
    for (const [id, state] of [...beginner]) {
      if (state !== 'current') continue
      beginner.delete(id)
      apply(id)
    }
    for (const input of noteIds) {
      const id = normalizeNoteId(input)
      if (!id || beginner.get(id) === 'done') continue
      beginner.set(id, 'current')
      apply(id)
    }
  }

  function clearAll() {
    results.clear()
    beginner.clear()
    for (const noteId of [...marked.keys()]) unmark(noteId)
  }

  return {
    onRenderMusicScore,
    setNoteResult,
    clearResults,
    setResultsVisible,
    clearBeginner,
    markBeginnerBatchDone,
    setBeginnerCurrentBatch,
    clearAll
  }
}

export type ScoreNoteFillMarker = ReturnType<typeof createScoreNoteFillMarker>
