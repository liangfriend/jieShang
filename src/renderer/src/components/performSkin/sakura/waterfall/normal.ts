import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawSakuraNormalLayer } from '../../canvas/sakuraBackground'

export const sakuraWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawSakuraNormalLayer,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
