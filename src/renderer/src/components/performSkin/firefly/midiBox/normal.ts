import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawFireflyNormalLayer } from '../../canvas/fireflyBackground'

export const fireflyMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawFireflyNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 999 })
}
