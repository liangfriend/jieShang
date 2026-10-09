import type { WaterfallColumnCanvasCommand } from '../../types'
import { PERFORM_WATERFALL_COLUMN_SHAPE } from '../../shapePresets'
import { drawImperialDragonNormalLayer } from '../../canvas/imperialDragonBackground'

export const imperialDragonWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawImperialDragonNormalLayer,
  getShape: () => ({ ...PERFORM_WATERFALL_COLUMN_SHAPE, borderRadius: 4 })
}
