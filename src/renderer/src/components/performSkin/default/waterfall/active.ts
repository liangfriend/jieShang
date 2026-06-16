import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const ACTIVE_COLOR = '#2196f3'

export const defaultWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, ACTIVE_COLOR, input)
  },
  getShape: () => getPerformWaterfallActiveColumnShape(0.85)
}
