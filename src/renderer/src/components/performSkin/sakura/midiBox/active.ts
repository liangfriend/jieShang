import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawSakuraActiveLayer } from '../../canvas/sakuraBackground'

export const sakuraMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawSakuraActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 5 })
}
