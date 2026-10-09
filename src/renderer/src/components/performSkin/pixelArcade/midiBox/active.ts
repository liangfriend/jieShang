import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawPixelArcadeActiveLayer } from '../../canvas/pixelArcadeBackground'

export const pixelArcadeMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawPixelArcadeActiveLayer,
  getShape: (input) => ({ width: input.blockSize, borderRadius: 0, opacity: input.fallen ? 0.35 : 1 })
}
