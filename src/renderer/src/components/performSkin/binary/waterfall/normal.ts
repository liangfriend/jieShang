import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawBinaryMatrixLayerBackground } from '../../canvas/binaryMatrixBackground'

export const binaryWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawBinaryMatrixLayerBackground,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
