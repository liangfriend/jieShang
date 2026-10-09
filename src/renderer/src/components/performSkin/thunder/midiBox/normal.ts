import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawThunderNormalLayer } from '../../canvas/thunderBackground'

export const thunderMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawThunderNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 2 })
}
