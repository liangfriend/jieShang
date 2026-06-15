import type { CSSProperties } from 'vue'
import type {
  WaterfallActiveColumnStyleInput,
  WaterfallColumnStyleInput
} from '@renderer/components/performSkin/types'

export type MidiColumnLayout = {
  x: number
  width: number
}

export type WaterfallNoteDraw = {
  midi: number
  start: number
  end: number
}

export type WaterfallHighlightDraw = {
  midi: number
  start: number
  end: number
}

export type ColumnVisual = {
  columnWidth: number
  opacity: number
  borderRadius: number
  /** solid color or gradient stops description */
  fill:
    | { type: 'solid'; color: string }
    | { type: 'linear'; stops: { offset: number; color: string }[] }
  boxShadow?: string
}

function parsePx(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number') return value
  if (!value) return fallback
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : fallback
}

function parseOpacity(value: string | number | undefined): number {
  if (value == null) return 1
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(n) ? n : 1
}

function parseBorderRadius(value: string | number | undefined, height: number): number {
  const raw = parsePx(value, 0)
  if (String(value).includes('999') || raw > height / 2) return height / 2
  return raw
}

function splitCssCommaList(value: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  for (const ch of value) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function extractCssFunctionBody(source: string, fnName: string): string | null {
  const marker = `${fnName}(`
  const startIdx = source.indexOf(marker)
  if (startIdx === -1) return null

  let depth = 0
  const bodyStart = startIdx + marker.length
  for (let i = bodyStart; i < source.length; i++) {
    const ch = source[i]
    if (ch === '(') depth++
    else if (ch === ')') {
      if (depth === 0) return source.slice(bodyStart, i)
      depth--
    }
  }
  return null
}

function isLinearGradientDirection(part: string): boolean {
  return /^\d+(?:\.\d+)?deg$/.test(part) || /^to\s+/i.test(part)
}

const CSS_COLOR_PATTERN = '(#[0-9a-fA-F]{3,8}|rgba?\\([^)]+\\)|hsla?\\([^)]+\\))'

function parseLinearGradient(background: string): ColumnVisual['fill'] | null {
  const body = extractCssFunctionBody(background, 'linear-gradient')
  if (!body) return null

  const parts = splitCssCommaList(body).filter((part) => !isLinearGradientDirection(part))
  if (!parts.length) return null

  const stopPattern = new RegExp(`^${CSS_COLOR_PATTERN}\\s*(\\d+(?:\\.\\d+)?%)?$`)
  const stops: { offset: number; color: string }[] = []

  for (let index = 0; index < parts.length; index++) {
    const match = parts[index].match(stopPattern)
    if (!match) continue
    stops.push({
      offset: match[2] ? parseFloat(match[2]) / 100 : index / Math.max(parts.length - 1, 1),
      color: match[1]
    })
  }

  if (!stops.length) return null
  return { type: 'linear', stops }
}

export function parseColumnVisual(style: CSSProperties, fallbackHeight: number): ColumnVisual {
  const columnWidth = parsePx(style.width, 14)
  const opacity = parseOpacity(style.opacity)
  const borderRadius = parseBorderRadius(style.borderRadius, fallbackHeight)
  const background = typeof style.background === 'string' ? style.background : ''

  const gradient = parseLinearGradient(background)
  if (gradient) {
    return { columnWidth, opacity, borderRadius, fill: gradient, boxShadow: style.boxShadow }
  }

  const solid = background || '#ffeb3b'
  return { columnWidth, opacity, borderRadius, fill: { type: 'solid', color: solid } }
}

export function buildMidiColumnLayouts(
  midiMin: number,
  midiMax: number,
  getMidiWidth: (midi: number) => number
): Map<number, MidiColumnLayout> {
  const layouts = new Map<number, MidiColumnLayout>()
  let x = 0
  for (let midi = midiMin; midi <= midiMax; midi++) {
    const width = getMidiWidth(midi)
    layouts.set(midi, { x, width })
    x += width
  }
  return layouts
}

function createFill(
  ctx: CanvasRenderingContext2D,
  visual: ColumnVisual,
  x: number,
  y: number,
  width: number,
  height: number
): string | CanvasGradient {
  if (visual.fill.type === 'solid') return visual.fill.color
  const gradient = ctx.createLinearGradient(x, y, x, y + height)
  for (const stop of visual.fill.stops) {
    gradient.addColorStop(stop.offset, stop.color)
  }
  return gradient
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  if (r <= 0) {
    ctx.rect(x, y, width, height)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawColumn(
  ctx: CanvasRenderingContext2D,
  layout: MidiColumnLayout,
  visual: ColumnVisual,
  top: number,
  height: number
) {
  if (height <= 0) return
  const columnWidth = visual.columnWidth
  const x = layout.x + (layout.width - columnWidth) / 2
  const y = top
  const fill = createFill(ctx, visual, x, y, columnWidth, height)
  ctx.save()
  ctx.globalAlpha = visual.opacity
  drawRoundedRect(ctx, x, y, columnWidth, height, visual.borderRadius)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()
}

export type DrawWaterfallFrameInput = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  baseLineBottom: number
  columnHeightConstant: number
  currentTime: number
  midiLayouts: Map<number, MidiColumnLayout>
  notes: WaterfallNoteDraw[]
  highlights: WaterfallHighlightDraw[]
  getNormalVisual: (input: WaterfallColumnStyleInput) => ColumnVisual
  getActiveVisual: (input: WaterfallActiveColumnStyleInput) => ColumnVisual
}

export function drawWaterfallFrame(input: DrawWaterfallFrameInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    columnHeightConstant: chc,
    currentTime,
    midiLayouts,
    notes,
    highlights,
    getNormalVisual,
    getActiveVisual
  } = input

  ctx.clearRect(0, 0, width, height)
  const baselineY = height - baseLineBottom

  for (const note of notes) {
    const layout = midiLayouts.get(note.midi)
    if (!layout) continue

    const noteTop = baselineY - (note.end - currentTime) * chc
    const noteHeight = (note.end - note.start) * chc
    const noteBottom = noteTop + noteHeight

    if (noteBottom < 0 || noteTop > height) continue

    const visual = getNormalVisual({
      midi: note.midi,
      start: note.start,
      end: note.end,
      columnHeightConstant: chc
    })
    drawColumn(ctx, layout, visual, noteTop, noteHeight)
  }

  for (const segment of highlights) {
    const layout = midiLayouts.get(segment.midi)
    if (!layout) continue

    const noteTop = baselineY - (segment.end - currentTime) * chc
    const noteHeight = (segment.end - segment.start) * chc
    const noteBottom = noteTop + noteHeight

    if (noteBottom < 0 || noteTop > height) continue

    const visual = getActiveVisual({
      start: segment.start,
      end: segment.end,
      columnHeightConstant: chc
    })
    drawColumn(ctx, layout, visual, noteTop, noteHeight)
  }
}
