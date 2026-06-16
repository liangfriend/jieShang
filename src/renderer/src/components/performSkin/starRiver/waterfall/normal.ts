import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawStarRiverGalaxyNormalBackground } from '../../canvas/starRiverGalaxyBackground'

export const starRiverWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawStarRiverGalaxyNormalBackground,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
