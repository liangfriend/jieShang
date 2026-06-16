import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const ACTIVE_COLOR = '#2196f3'

export const defaultMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, ACTIVE_COLOR, input)
  },
  getShape: (input) => ({
    width: input.blockSize,
    borderRadius: 3,
    opacity: input.fallen ? 0.35 : 1
  })
}
