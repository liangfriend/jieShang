import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawThunderNormalLayer } from '../../canvas/thunderBackground'

export const thunderWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawThunderNormalLayer,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
