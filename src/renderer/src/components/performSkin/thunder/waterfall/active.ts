import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawThunderActiveLayer } from '../../canvas/thunderBackground'

export const thunderWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawThunderActiveLayer,
  getShape: () => getPerformWaterfallActiveColumnShape(1)
}
