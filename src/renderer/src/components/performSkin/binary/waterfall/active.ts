import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawBinaryActiveLayerBackground } from '../../canvas/binaryGradientEffect'

export const binaryWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawBinaryActiveLayerBackground,
  getShape: () => getPerformWaterfallActiveColumnShape(0.88)
}
