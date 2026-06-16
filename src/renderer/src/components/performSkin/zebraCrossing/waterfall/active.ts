import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawZebraActiveLayerBackground } from '../../canvas/zebraActiveBackground'

export const zebraCrossingWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawZebraActiveLayerBackground,
  getShape: () => getPerformWaterfallActiveColumnShape(0.92)
}
