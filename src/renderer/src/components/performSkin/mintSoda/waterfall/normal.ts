import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawMintSodaNormalLayer } from '../../canvas/mintSodaBackground'

export const mintSodaWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawMintSodaNormalLayer,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
