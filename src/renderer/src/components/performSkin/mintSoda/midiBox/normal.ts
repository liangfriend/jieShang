import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawMintSodaNormalLayer } from '../../canvas/mintSodaBackground'

export const mintSodaMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawMintSodaNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 6 })
}
