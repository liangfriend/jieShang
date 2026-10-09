import type { MusicScore, VDom } from '@deciphony/renderer'
import type { PlayHighlightProgressData } from '@deciphony/extensions/dr-play-highlight'
import { NOTE_PART_TAGS } from '@deciphony/extensions/dr-play-highlight'
import { stripPlayNoteIdSuffix } from './scoreScrollToPlayingNote'

/** 播放时间轴（256 单位 = 一个全音符） */
export type SmoothScrollTimeline = {
  items: Array<{ time: number; noteId: string }>
  endTime: number
}

export type ScoreSmoothScrollDeps = {
  getScrollContainer: () => HTMLElement | null
  getVDomList: () => readonly VDom[]
  findElementByVDom: (node: VDom) => SVGElement | null
  getMusicScore: () => MusicScore | null | undefined
  getTimeline: () => SmoothScrollTimeline
  /** 外部时钟（256 单位）；不传则用内部时钟 + 进度回调校准 */
  getTime?: () => number | null
  /** 内部时钟是否走动 */
  isPlaying?: () => boolean
  /** 内部时钟速度：每毫秒多少 256 单位 */
  getUnitsPerMs?: () => number
}

type SequenceLike = ReadonlyArray<{ playTime: number; duration: number; data?: unknown }>

/** 进度回调时间与内部时钟偏差超过该值（256 单位）直接对齐，否则平滑追赶 */
const SNAP_UNITS = 64
const CORRECTION_MS = 250
/** 开始时从当前滚动位置追到时间轴位置的衰减时间常数 */
const CATCH_UP_MS = 220

function defaultNoteIdOf(data: unknown): string | null {
  const id = (data as { note_id?: unknown } | null)?.note_id
  return typeof id === 'string' && id.trim() ? id.trim() : null
}

export function sequenceToSmoothScrollTimeline(
  sequence: SequenceLike,
  noteIdOf: (data: unknown) => string | null = defaultNoteIdOf
): SmoothScrollTimeline {
  const items: SmoothScrollTimeline['items'] = []
  let endTime = 0
  for (const item of sequence) {
    endTime = Math.max(endTime, item.playTime + item.duration)
    const noteId = noteIdOf(item.data)
    if (noteId) items.push({ time: item.playTime, noteId })
  }
  return { items, endTime }
}

type Curve = { times: number[]; values: number[]; tangents: number[] }

/** Fritsch–Carlson 单调三次插值切线：C1 平滑且不过冲 */
function monotoneTangents(t: number[], y: number[]): number[] {
  const n = t.length
  const m = new Array<number>(n).fill(0)
  if (n < 2) return m
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) d.push((y[i + 1]! - y[i]!) / (t[i + 1]! - t[i]!))
  m[0] = d[0]!
  m[n - 1] = d[n - 2]!
  for (let i = 1; i < n - 1; i++) {
    m[i] = d[i - 1]! * d[i]! <= 0 ? 0 : (d[i - 1]! + d[i]!) / 2
  }
  for (let i = 0; i < n - 1; i++) {
    const di = d[i]!
    if (di === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i]! / di
    const b = m[i + 1]! / di
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      m[i] = tau * a * di
      m[i + 1] = tau * b * di
    }
  }
  return m
}

function evaluateCurve(c: Curve, time: number): number {
  const { times: t, values: y, tangents: m } = c
  const n = t.length
  if (time <= t[0]!) return y[0]!
  if (time >= t[n - 1]!) return y[n - 1]!
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (t[mid]! <= time) lo = mid
    else hi = mid
  }
  const h = t[hi]! - t[lo]!
  const s = (time - t[lo]!) / h
  const s2 = s * s
  const s3 = s2 * s
  return (
    (2 * s3 - 3 * s2 + 1) * y[lo]! +
    (s3 - 2 * s2 + s) * h * m[lo]! +
    (-2 * s3 + 3 * s2) * y[hi]! +
    (s3 - s2) * h * m[hi]!
  )
}

function rootSvg(el: Element): SVGSVGElement | null {
  let svg: SVGSVGElement | null = el instanceof SVGSVGElement ? el : (el as SVGElement).ownerSVGElement
  while (svg?.ownerSVGElement) svg = svg.ownerSVGElement
  return svg
}

/**
 * 单行模式平滑跟滚：播放前按「时间 → 横向位置」全局建关键帧，
 * 播放中每帧按播放时间插值直接写 scrollLeft。
 * 关键帧取每个发音时刻的音符位置（反复按播放顺序重复出现），结尾取末小节右缘，
 * 关键帧之间用单调三次插值平滑过渡，发音时刻音符正好在中央。
 */
export function createScoreSmoothScroll(deps: ScoreSmoothScrollDeps) {
  let curve: Curve | null = null
  let running = false
  let rafId = 0
  let clock = 0
  let pendingCorrection = 0
  let lastFrame = 0
  let catchUpOffset = 0
  let lastLeft = Number.NaN

  function buildCurve(): Curve | null {
    const container = deps.getScrollContainer()
    if (!container) return null
    const list = deps.getVDomList()
    const { items, endTime } = deps.getTimeline()
    const measures: VDom[] = []
    const noteVDoms = new Map<string, VDom>()
    for (const node of list) {
      if (node.tag === 'measure') measures.push(node)
      else if (node.targetId && NOTE_PART_TAGS.has(node.tag) && !noteVDoms.has(node.targetId)) {
        noteVDoms.set(node.targetId, node)
      }
    }
    const sorted = [...items].sort((a, b) => a.time - b.time)

    const times: number[] = []
    const xs: number[] = []
    let svg: SVGSVGElement | null = null
    for (const item of sorted) {
      if (times.length && item.time <= times[times.length - 1]!) continue
      const vdom =
        noteVDoms.get(item.noteId) ?? noteVDoms.get(stripPlayNoteIdSuffix(item.noteId))
      if (!vdom) continue
      if (!svg) {
        const el = deps.findElementByVDom(vdom)
        svg = el ? rootSvg(el) : null
      }
      times.push(item.time)
      xs.push(vdom.x + vdom.w / 2)
    }
    if (!svg || !times.length) return null
    if (endTime > times[times.length - 1]!) {
      const lastX = xs[xs.length - 1]!
      const lastMeasure = measures.find((m) => lastX >= m.x && lastX < m.x + m.w)
      times.push(endTime)
      xs.push(lastMeasure ? lastMeasure.x + lastMeasure.w : lastX)
    }

    const svgRect = svg.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const scoreWidth = deps.getMusicScore()?.width || svgRect.width
    const scale = scoreWidth > 0 ? svgRect.width / scoreWidth : 1
    const contentLeft = svgRect.left - containerRect.left + container.scrollLeft
    const half = container.clientWidth / 2
    const values = xs.map((x) => contentLeft + x * scale - half)
    return { times, values, tangents: monotoneTangents(times, values) }
  }

  function currentTime(): number {
    if (deps.getTime) return deps.getTime() ?? clock
    return clock
  }

  function frame(now: number) {
    if (!running) return
    const dt = Math.max(0, now - lastFrame)
    lastFrame = now
    if (!deps.getTime && (deps.isPlaying?.() ?? true)) {
      clock += dt * (deps.getUnitsPerMs?.() ?? 0)
      if (pendingCorrection) {
        const step = pendingCorrection * Math.min(1, dt / CORRECTION_MS)
        clock += step
        pendingCorrection -= step
      }
    }
    catchUpOffset *= Math.exp(-dt / CATCH_UP_MS)
    if (Math.abs(catchUpOffset) < 0.5) catchUpOffset = 0

    const container = deps.getScrollContainer()
    if (container && curve) {
      // 不读 scrollWidth：每帧读布局属性会强制同步布局；超出右边界由浏览器自行截断
      const left = Math.max(0, evaluateCurve(curve, currentTime()) + catchUpOffset)
      // 时间不走（暂停）时不写，允许用户手动拖动
      if (Math.abs(left - lastLeft) >= 0.01 || Number.isNaN(lastLeft)) {
        container.scrollLeft = left
        lastLeft = left
      }
    }
    rafId = requestAnimationFrame(frame)
  }

  /** 播放前（如预备拍开始时）预先建关键帧，避免首个音符回调里卡主线程 */
  function prepare() {
    if (running) return
    curve = buildCurve()
  }

  /** 播放开始：用预建（或现建）的关键帧启动逐帧滚动 */
  function start(atTime = 0) {
    const prepared = curve
    stop()
    curve = prepared ?? buildCurve()
    if (!curve) return
    clock = atTime
    pendingCorrection = 0
    const container = deps.getScrollContainer()
    catchUpOffset = container ? container.scrollLeft - evaluateCurve(curve, currentTime()) : 0
    lastLeft = Number.NaN
    lastFrame = performance.now()
    running = true
    rafId = requestAnimationFrame(frame)
  }

  function stop() {
    running = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    curve = null
  }

  /** 内部时钟：用播放器音符开始回调校准 */
  function sync(playTime: number) {
    if (deps.getTime) return
    const err = playTime - clock
    if (Math.abs(err) > SNAP_UNITS) {
      clock = playTime
      pendingCorrection = 0
    } else {
      pendingCorrection = err
    }
  }

  function handleProgressStart(data: PlayHighlightProgressData) {
    if (!data?.start || typeof data.playTime !== 'number') return
    if (!running) start(data.playTime)
    else sync(data.playTime)
  }

  return { prepare, start, stop, sync, handleProgressStart, isRunning: () => running }
}

export type ScoreSmoothScrollApi = ReturnType<typeof createScoreSmoothScroll>
