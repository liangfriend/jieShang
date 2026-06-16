import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawRainbowMidiBoxNormalLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawRainbowMidiBoxNormalLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
