import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawRainbowMidiBoxActiveLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawRainbowMidiBoxActiveLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
