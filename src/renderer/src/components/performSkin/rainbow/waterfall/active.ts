import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawRainbowActiveLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawRainbowActiveLayerBackground,
  getShape: () => getPerformWaterfallActiveColumnShape(0.85)
}
