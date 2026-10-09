import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawAuroraActiveLayer } from '../../canvas/auroraBackground'

export const auroraMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawAuroraActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 4 })
}
