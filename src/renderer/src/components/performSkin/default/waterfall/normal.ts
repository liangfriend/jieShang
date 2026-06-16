import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const NORMAL_COLOR = '#ffeb3b'

export const defaultWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, NORMAL_COLOR, input)
  },
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
