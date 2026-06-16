import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawBinaryMatrixLayerBackground } from '../../canvas/binaryMatrixBackground'

export const binaryMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawBinaryMatrixLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
