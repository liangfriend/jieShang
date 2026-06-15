import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawRainbowMidiBoxNormalLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawRainbowMidiBoxNormalLayerBackground,
  getShape: (input) => ({
    width: input.blockSize,
    borderRadius: 3,
    opacity: input.fallen ? 0.35 : 1
  })
}
