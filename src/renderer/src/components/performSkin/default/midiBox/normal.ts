import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const NORMAL_COLOR = '#ffeb3b'

export const defaultMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, NORMAL_COLOR, input)
  },
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
