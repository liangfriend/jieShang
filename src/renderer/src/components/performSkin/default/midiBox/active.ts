import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const ACTIVE_COLOR = '#2196f3'

export const defaultMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, ACTIVE_COLOR, input)
  },
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
