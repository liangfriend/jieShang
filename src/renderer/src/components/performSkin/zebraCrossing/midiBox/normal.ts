import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawZebraStripeLayerBackground } from '../../canvas/zebraStripeBackground'

export const zebraCrossingMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawZebraStripeLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
