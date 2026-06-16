import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawStarRiverActiveLayerBackground } from '../../canvas/starRiverGradientEffect'

export const starRiverMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawStarRiverActiveLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
