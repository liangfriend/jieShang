import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawPixelArcadeNormalLayer } from '../../canvas/pixelArcadeBackground'

export const pixelArcadeMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawPixelArcadeNormalLayer,
  getShape: (input) => ({ width: input.blockSize, borderRadius: 0, opacity: input.fallen ? 0.35 : 1 })
}
