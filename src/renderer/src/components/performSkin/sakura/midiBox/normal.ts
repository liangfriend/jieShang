import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawSakuraNormalLayer } from '../../canvas/sakuraBackground'

export const sakuraMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawSakuraNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 5 })
}
