import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawRainbowMidiBoxActiveLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawRainbowMidiBoxActiveLayerBackground,
  getShape: (input) => ({
    width: input.blockSize,
    borderRadius: 3,
    opacity: input.fallen ? 0.35 : 1
  })
}
