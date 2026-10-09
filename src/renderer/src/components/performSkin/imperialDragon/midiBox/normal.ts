import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawImperialDragonNormalLayer } from '../../canvas/imperialDragonBackground'

export const imperialDragonMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawImperialDragonNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 3 })
}
