import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawMintSodaActiveLayer } from '../../canvas/mintSodaBackground'

export const mintSodaMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawMintSodaActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 6 })
}
