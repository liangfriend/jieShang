import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawZebraStripeLayerBackground } from '../../canvas/zebraStripeBackground'

export const zebraCrossingWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawZebraStripeLayerBackground,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
