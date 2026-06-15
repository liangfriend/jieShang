import type {
  WaterfallActiveColumnCanvasCommand,
  WaterfallColumnCanvasCommand,
  WaterfallColumnStyleInput
} from '@renderer/components/performSkin/types'
import { drawLayerWithUnifiedColumnClip, type LayerColumnClip } from '@renderer/utils/performLayerBackground'

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

export { drawRoundedRectPath, appendRoundedRectPath } from '@renderer/utils/canvasGeometry'

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

function collectWaterfallColumnClips(
  items: Array<{
    midi: number
    top: number
    height: number
    getStyleInput: () => WaterfallColumnStyleInput | { start: number; end: number; columnHeightConstant: number }
  }>,
  midiLayouts: Map<number, MidiColumnLayout>,
  getShape: (input: WaterfallColumnStyleInput | { start: number; end: number; columnHeightConstant: number }) => {
    width: number
    borderRadius: number
    opacity: number
  }
): LayerColumnClip[] {
  const columns: LayerColumnClip[] = []

  for (const item of items) {
    const layout = midiLayouts.get(item.midi)
    if (!layout || item.height <= 0) continue

    const styleInput = item.getStyleInput()
    const shape = getShape(styleInput)
    const x = layout.x + (layout.width - shape.width) / 2

    columns.push({
      x,
      y: item.top,
      width: shape.width,
      height: item.height,
      borderRadius: shape.borderRadius,
      opacity: shape.opacity
    })
  }

  return columns
}

type WaterfallLayerBaseInput = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  baseLineBottom: number
  columnHeightConstant: number
  currentTime: number
  dpr: number
  midiLayouts: Map<number, MidiColumnLayout>
}

export type DrawWaterfallNormalLayerInput = WaterfallLayerBaseInput & {
  notes: WaterfallNoteDraw[]
  command: WaterfallColumnCanvasCommand
}

export type DrawWaterfallActiveLayerInput = WaterfallLayerBaseInput & {
  highlights: WaterfallHighlightDraw[]
  command: WaterfallActiveColumnCanvasCommand
}

/** 第二层：整层背景一次 + 所有 normal 水柱统一 clip */
export function drawWaterfallNormalLayer(input: DrawWaterfallNormalLayerInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    columnHeightConstant: chc,
    currentTime,
    dpr,
    midiLayouts,
    notes,
    command
  } = input

  const baselineY = height - baseLineBottom
  const time = currentTime
  const visibleItems: Array<{
    midi: number
    top: number
    height: number
    getStyleInput: () => WaterfallColumnStyleInput
  }> = []

  for (const note of notes) {
    const noteTop = baselineY - (note.end - currentTime) * chc
    const noteHeight = (note.end - note.start) * chc
    const noteBottom = noteTop + noteHeight

    if (noteBottom < 0 || noteTop > height) continue

    visibleItems.push({
      midi: note.midi,
      top: noteTop,
      height: noteHeight,
      getStyleInput: () => ({
        midi: note.midi,
        start: note.start,
        end: note.end,
        columnHeightConstant: chc
      })
    })
  }

  const columns = collectWaterfallColumnClips(visibleItems, midiLayouts, (styleInput) =>
    command.getShape(styleInput as WaterfallColumnStyleInput)
  )

  drawLayerWithUnifiedColumnClip(ctx, width, height, dpr, time, columns, command.drawBackground)
}

/** 第三层：整层背景一次 + 所有 active 水柱统一 clip */
export function drawWaterfallActiveLayer(input: DrawWaterfallActiveLayerInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    columnHeightConstant: chc,
    currentTime,
    dpr,
    midiLayouts,
    highlights,
    command
  } = input

  const baselineY = height - baseLineBottom
  const time = currentTime
  const visibleItems: Array<{
    midi: number
    top: number
    height: number
    getStyleInput: () => { start: number; end: number; columnHeightConstant: number }
  }> = []

  for (const segment of highlights) {
    const noteTop = baselineY - (segment.end - currentTime) * chc
    const noteHeight = (segment.end - segment.start) * chc
    const noteBottom = noteTop + noteHeight

    if (noteBottom < 0 || noteTop > height) continue

    visibleItems.push({
      midi: segment.midi,
      top: noteTop,
      height: noteHeight,
      getStyleInput: () => ({
        start: segment.start,
        end: segment.end,
        columnHeightConstant: chc
      })
    })
  }

  const columns = collectWaterfallColumnClips(visibleItems, midiLayouts, (styleInput) =>
    command.getShape(styleInput as { start: number; end: number; columnHeightConstant: number })
  )

  drawLayerWithUnifiedColumnClip(ctx, width, height, dpr, time, columns, command.drawBackground)
}
