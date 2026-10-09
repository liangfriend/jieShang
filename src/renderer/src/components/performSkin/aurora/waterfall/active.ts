import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawAuroraActiveLayer } from '../../canvas/auroraBackground'

export const auroraWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawAuroraActiveLayer,
  getShape: () => getPerformWaterfallActiveColumnShape(1)
}
