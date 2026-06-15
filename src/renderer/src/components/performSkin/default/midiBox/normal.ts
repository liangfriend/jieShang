import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const NORMAL_COLOR = '#ffeb3b'

export const defaultMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, NORMAL_COLOR, input)
  },
  getShape: (input) => ({
    width: input.blockSize,
    borderRadius: 3,
    opacity: input.fallen ? 0.35 : 1
  })
}
