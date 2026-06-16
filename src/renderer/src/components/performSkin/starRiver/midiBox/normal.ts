import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawStarRiverGalaxyNormalBackground } from '../../canvas/starRiverGalaxyBackground'

export const starRiverMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawStarRiverGalaxyNormalBackground,
  getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
}
