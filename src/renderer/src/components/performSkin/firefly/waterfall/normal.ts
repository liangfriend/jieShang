import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawFireflyNormalLayer } from '../../canvas/fireflyBackground'

export const fireflyWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawFireflyNormalLayer,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
