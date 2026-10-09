import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawThunderActiveLayer } from '../../canvas/thunderBackground'

export const thunderMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawThunderActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 2 })
}
