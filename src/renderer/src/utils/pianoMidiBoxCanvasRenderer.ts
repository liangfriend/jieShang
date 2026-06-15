import type { MidiBoxBlockCanvasCommand, MidiBoxBlockStyleInput } from '@renderer/components/performSkin/types'
import {
  buildMidiColumnLayouts,
  type MidiColumnLayout
} from '@renderer/utils/pianoWaterfallCanvasRenderer'
import { drawLayerWithUnifiedColumnClip, type LayerColumnClip } from '@renderer/utils/performLayerBackground'

export type MidiBoxBlockDraw = {
  midi: number
  batchIndex: number
  highlighted: boolean
  fallen: boolean
}

export { buildMidiColumnLayouts, type MidiColumnLayout }

function buildStyleInput(
  block: MidiBoxBlockDraw,
  blockSize: number,
  blockStride: number,
  baseLineBottom: number,
  highlighted: boolean,
  fallen: boolean
): MidiBoxBlockStyleInput {
  return {
    midi: block.midi,
    batchIndex: block.batchIndex,
    blockSize,
    blockStride,
    baseLineBottom,
    highlighted,
    fallen,
    fallDuration: 0
  }
}

function collectMidiBoxColumnClips(
  blocks: Array<{ block: MidiBoxBlockDraw; top: number; styleInput: MidiBoxBlockStyleInput }>,
  midiLayouts: Map<number, MidiColumnLayout>,
  command: MidiBoxBlockCanvasCommand
): LayerColumnClip[] {
  const columns: LayerColumnClip[] = []

  for (const { block, top, styleInput } of blocks) {
    const layout = midiLayouts.get(block.midi)
    if (!layout) continue

    const shape = command.getShape(styleInput)
    const x = layout.x + (layout.width - shape.width) / 2

    columns.push({
      x,
      y: top,
      width: shape.width,
      height: styleInput.blockSize,
      borderRadius: shape.borderRadius,
      opacity: shape.opacity
    })
  }

  return columns
}

type MidiBoxLayerBaseInput = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  baseLineBottom: number
  blockSize: number
  blockStride: number
  fallScrollOffset: number
  dpr: number
  midiLayouts: Map<number, MidiColumnLayout>
  /** 与本次 play 同步的毫秒时间，停止时为 0 */
  layerTime: number
}

export type DrawMidiBoxNormalLayerInput = MidiBoxLayerBaseInput & {
  blocks: MidiBoxBlockDraw[]
  command: MidiBoxBlockCanvasCommand
}

export type DrawMidiBoxActiveLayerInput = MidiBoxLayerBaseInput & {
  blocks: MidiBoxBlockDraw[]
  command: MidiBoxBlockCanvasCommand
}

/** 第二层：整层背景一次 + 所有 normal 方块统一 clip */
export function drawMidiBoxNormalLayer(input: DrawMidiBoxNormalLayerInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    blockSize,
    blockStride,
    fallScrollOffset,
    dpr,
    midiLayouts,
    blocks,
    command,
    layerTime
  } = input

  const baselineY = height - baseLineBottom
  const time = layerTime
  const visible: Array<{ block: MidiBoxBlockDraw; top: number; styleInput: MidiBoxBlockStyleInput }> = []

  for (const block of blocks) {
    const blockBottom = baselineY - block.batchIndex * blockStride + fallScrollOffset
    const blockTop = blockBottom - blockSize

    if (blockBottom < 0 || blockTop > height) continue

    visible.push({
      block,
      top: blockTop,
      styleInput: buildStyleInput(
        block,
        blockSize,
        blockStride,
        baseLineBottom,
        block.highlighted,
        block.fallen
      )
    })
  }

  const columns = collectMidiBoxColumnClips(visible, midiLayouts, command)
  drawLayerWithUnifiedColumnClip(ctx, width, height, dpr, time, columns, command.drawBackground)
}

/** 第三层：整层背景一次 + 所有 active 方块统一 clip */
export function drawMidiBoxActiveLayer(input: DrawMidiBoxActiveLayerInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    blockSize,
    blockStride,
    fallScrollOffset,
    dpr,
    midiLayouts,
    blocks,
    command,
    layerTime
  } = input

  const baselineY = height - baseLineBottom
  const time = layerTime
  const visible: Array<{ block: MidiBoxBlockDraw; top: number; styleInput: MidiBoxBlockStyleInput }> = []

  for (const block of blocks) {
    if (!block.highlighted) continue

    const blockBottom = baselineY - block.batchIndex * blockStride + fallScrollOffset
    const blockTop = blockBottom - blockSize

    if (blockBottom < 0 || blockTop > height) continue

    visible.push({
      block,
      top: blockTop,
      styleInput: buildStyleInput(block, blockSize, blockStride, baseLineBottom, true, block.fallen)
    })
  }

  const columns = collectMidiBoxColumnClips(visible, midiLayouts, command)
  drawLayerWithUnifiedColumnClip(ctx, width, height, dpr, time, columns, command.drawBackground)
}
