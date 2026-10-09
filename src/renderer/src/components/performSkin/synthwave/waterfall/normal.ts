import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawSynthwaveNormalLayer } from '../../canvas/synthwaveBackground'

export const synthwaveWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawSynthwaveNormalLayer,
  getShape: () => PERFORM_WATERFALL_COLUMN_SHAPE
}
