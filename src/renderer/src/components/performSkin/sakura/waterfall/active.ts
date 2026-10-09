import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawSakuraActiveLayer } from '../../canvas/sakuraBackground'

export const sakuraWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawSakuraActiveLayer,
  getShape: () => getPerformWaterfallActiveColumnShape(0.95)
}
