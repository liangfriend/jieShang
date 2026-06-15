import type { MidiBoxBlockStyleInput } from '@renderer/components/performSkin/types'
import {
  buildMidiColumnLayouts,
  type ColumnVisual,
  type MidiColumnLayout
} from '@renderer/utils/pianoWaterfallCanvasRenderer'

export type MidiBoxBlockDraw = {
  midi: number
  batchIndex: number
  highlighted: boolean
  fallen: boolean
}

export { buildMidiColumnLayouts, type MidiColumnLayout, type ColumnVisual }

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

function drawBlock(
  ctx: CanvasRenderingContext2D,
  layout: MidiColumnLayout,
  visual: ColumnVisual,
  top: number,
  size: number
) {
  const blockWidth = visual.columnWidth
  const x = layout.x + (layout.width - blockWidth) / 2
  const fill = createFill(ctx, visual, x, top, blockWidth, size)

  ctx.save()
  ctx.globalAlpha = visual.opacity
  drawRoundedRect(ctx, x, top, blockWidth, size, visual.borderRadius)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()
}

export type DrawMidiBoxFrameInput = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  baseLineBottom: number
  blockSize: number
  blockStride: number
  fallScrollOffset: number
  midiLayouts: Map<number, MidiColumnLayout>
  blocks: MidiBoxBlockDraw[]
  getNormalVisual: (input: MidiBoxBlockStyleInput) => ColumnVisual
  getActiveVisual: (input: MidiBoxBlockStyleInput) => ColumnVisual
}

export function drawMidiBoxFrame(input: DrawMidiBoxFrameInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    blockSize,
    blockStride,
    fallScrollOffset,
    midiLayouts,
    blocks,
    getNormalVisual,
    getActiveVisual
  } = input

  ctx.clearRect(0, 0, width, height)
  const baselineY = height - baseLineBottom

  for (const block of blocks) {
    const layout = midiLayouts.get(block.midi)
    if (!layout) continue

    const blockBottom = baselineY - block.batchIndex * blockStride + fallScrollOffset
    const blockTop = blockBottom - blockSize

    if (blockBottom < 0 || blockTop > height) continue

    const styleInput: MidiBoxBlockStyleInput = {
      midi: block.midi,
      batchIndex: block.batchIndex,
      blockSize,
      blockStride,
      baseLineBottom,
      highlighted: block.highlighted,
      fallen: block.fallen,
      fallDuration: 0
    }

    const visual = block.highlighted
      ? getActiveVisual(styleInput)
      : getNormalVisual(styleInput)

    drawBlock(ctx, layout, visual, blockTop, blockSize)
  }
}
