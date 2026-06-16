import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawStarRiverActiveLayerBackground } from '../../canvas/starRiverGradientEffect'

export const starRiverWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawStarRiverActiveLayerBackground,
  getShape: () => getPerformWaterfallActiveColumnShape(0.9)
}
