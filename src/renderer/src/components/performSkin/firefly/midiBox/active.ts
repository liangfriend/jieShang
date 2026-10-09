import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawFireflyActiveLayer } from '../../canvas/fireflyBackground'

export const fireflyMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawFireflyActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 999 })
}
