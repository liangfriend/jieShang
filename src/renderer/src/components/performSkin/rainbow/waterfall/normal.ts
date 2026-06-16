import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawRainbowNormalLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawRainbowNormalLayerBackground,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
