import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawFireflyActiveLayer } from '../../canvas/fireflyBackground'

export const fireflyWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawFireflyActiveLayer,
  getShape: () => getPerformWaterfallActiveColumnShape(0.95)
}
