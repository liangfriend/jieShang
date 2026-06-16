import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawBinaryActiveLayerBackground } from '../../canvas/binaryGradientEffect'

export const binaryMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawBinaryActiveLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
