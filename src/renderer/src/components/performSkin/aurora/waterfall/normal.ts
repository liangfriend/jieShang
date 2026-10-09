import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawAuroraNormalLayer } from '../../canvas/auroraBackground'

export const auroraWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawAuroraNormalLayer,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
