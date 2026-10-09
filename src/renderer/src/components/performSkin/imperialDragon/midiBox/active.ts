import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawImperialDragonActiveLayer } from '../../canvas/imperialDragonBackground'

export const imperialDragonMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawImperialDragonActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 3 })
}
