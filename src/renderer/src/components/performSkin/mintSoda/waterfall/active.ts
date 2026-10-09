import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawMintSodaActiveLayer } from '../../canvas/mintSodaBackground'

export const mintSodaWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawMintSodaActiveLayer,
  getShape: () => getPerformWaterfallActiveColumnShape(0.95)
}
