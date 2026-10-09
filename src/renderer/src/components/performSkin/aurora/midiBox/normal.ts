import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawAuroraNormalLayer } from '../../canvas/auroraBackground'

export const auroraMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawAuroraNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 4 })
}
