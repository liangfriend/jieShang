import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawZebraActiveLayerBackground } from '../../canvas/zebraActiveBackground'

export const zebraCrossingMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawZebraActiveLayerBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
