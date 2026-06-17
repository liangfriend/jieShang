import { NOTE_RESULT_COLOR } from '@renderer/constant/practice'
import {
  STANDARD_TILTED_FILLED_OUTLINE_PATH,
  STANDARD_TILTED_NOTE_LOCAL,
  STANDARD_TILTED_RING_PATH,
  STANDARD_WHOLE_NOTE_LOCAL,
  STANDARD_WHOLE_NOTE_RING_PATH
} from './noteHeadOutlinePaths'
import type { NoteHeadGeometry, NoteHeadMarkerStyle } from './types'

const PLAY_COLOR = '#ff4040'
const BEGINNER_CURRENT_COLOR = '#2eb8a6'
const BEGINNER_DONE_COLOR = '#15803d'

const OUTLINE_WIDTH = 1.8

const PERFECT_GRADIENT_STOPS: Array<[number, string]> = [
  [0, '#ff3366'],
  [0.18, '#ff9933'],
  [0.36, '#ffdd00'],
  [0.54, '#33cc66'],
  [0.72, '#3399ff'],
  [1, '#ff3366']
]

type StrokePaint = string | CanvasGradient | CanvasPattern

function strokePath(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  paint: StrokePaint,
  lineWidth = OUTLINE_WIDTH
) {
  ctx.strokeStyle = paint
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke(path)
}

function withLocalTransform(
  ctx: CanvasRenderingContext2D,
  geom: NoteHeadGeometry,
  local: { offsetX: number; offsetY: number; width: number; height: number },
  draw: () => void
) {
  ctx.save()
  ctx.translate(geom.x, geom.y)
  ctx.scale(geom.w / local.width, geom.h / local.height)
  ctx.translate(local.offsetX, local.offsetY)
  draw()
  ctx.restore()
}

function drawStandardPath(
  ctx: CanvasRenderingContext2D,
  geom: NoteHeadGeometry,
  paint: StrokePaint,
  pathData: string,
  local: { offsetX: number; offsetY: number; width: number; height: number }
) {
  withLocalTransform(ctx, geom, local, () => {
    strokePath(ctx, new Path2D(pathData), paint)
  })
}

function traceNumberRect(ctx: CanvasRenderingContext2D, geom: NoteHeadGeometry, paint: StrokePaint) {
  const inset = Math.min(geom.w, geom.h) * 0.08
  const x = geom.x + inset
  const y = geom.y + inset
  const w = Math.max(0, geom.w - inset * 2)
  const h = Math.max(0, geom.h - inset * 2)
  const radius = Math.min(w, h) * 0.22

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.strokeStyle = paint
  ctx.lineWidth = OUTLINE_WIDTH
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()
}

function traceRestRect(ctx: CanvasRenderingContext2D, geom: NoteHeadGeometry, paint: StrokePaint) {
  const inset = Math.min(geom.w, geom.h) * 0.1
  const x = geom.x + inset
  const y = geom.y + inset
  const w = Math.max(0, geom.w - inset * 2)
  const h = Math.max(0, geom.h - inset * 2)

  ctx.save()
  ctx.strokeStyle = paint
  ctx.lineWidth = OUTLINE_WIDTH
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

function traceFallbackEllipse(ctx: CanvasRenderingContext2D, geom: NoteHeadGeometry, paint: StrokePaint) {
  const cx = geom.x + geom.w / 2
  const cy = geom.y + geom.h / 2
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(cx, cy, geom.w / 2, geom.h / 2, 0, 0, Math.PI * 2)
  ctx.strokeStyle = paint
  ctx.lineWidth = OUTLINE_WIDTH
  ctx.stroke()
  ctx.restore()
}

function createPerfectGradient(ctx: CanvasRenderingContext2D, geom: NoteHeadGeometry): CanvasGradient {
  const cx = geom.x + geom.w / 2
  const cy = geom.y + geom.h / 2
  const gradient = ctx.createConicGradient(0, cx, cy)
  for (const [stop, color] of PERFECT_GRADIENT_STOPS) {
    gradient.addColorStop(stop, color)
  }
  return gradient
}

function drawOutline(ctx: CanvasRenderingContext2D, geom: NoteHeadGeometry, paint: StrokePaint) {
  switch (geom.shapeKind) {
    case 'standard-whole':
      drawStandardPath(ctx, geom, paint, STANDARD_WHOLE_NOTE_RING_PATH, STANDARD_WHOLE_NOTE_LOCAL)
      break
    case 'standard-tilted-ring':
      drawStandardPath(ctx, geom, paint, STANDARD_TILTED_RING_PATH, STANDARD_TILTED_NOTE_LOCAL)
      break
    case 'standard-tilted-filled':
      drawStandardPath(ctx, geom, paint, STANDARD_TILTED_FILLED_OUTLINE_PATH, STANDARD_TILTED_NOTE_LOCAL)
      break
    case 'number':
      traceNumberRect(ctx, geom, paint)
      break
    case 'rest':
      traceRestRect(ctx, geom, paint)
      break
    default:
      traceFallbackEllipse(ctx, geom, paint)
      break
  }
}

function drawResultOutline(
  ctx: CanvasRenderingContext2D,
  geom: NoteHeadGeometry,
  result: NonNullable<NoteHeadMarkerStyle['result']>
) {
  if (result === 'perfect') {
    drawOutline(ctx, geom, createPerfectGradient(ctx, geom))
    return
  }
  drawOutline(ctx, geom, NOTE_RESULT_COLOR[result])
}

export function drawNoteHeadMarker(
  ctx: CanvasRenderingContext2D,
  geom: NoteHeadGeometry,
  style: NoteHeadMarkerStyle
) {
  switch (style.kind) {
    case 'play':
      drawOutline(ctx, geom, PLAY_COLOR)
      break
    case 'result':
      if (style.result) drawResultOutline(ctx, geom, style.result)
      break
    case 'beginner':
      if (style.beginnerState === 'current') {
        drawOutline(ctx, geom, BEGINNER_CURRENT_COLOR)
      } else if (style.beginnerState === 'done') {
        drawOutline(ctx, geom, BEGINNER_DONE_COLOR)
      }
      break
  }
}
