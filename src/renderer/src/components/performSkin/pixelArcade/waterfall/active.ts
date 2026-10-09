import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { drawPixelArcadeActiveLayer } from '../../canvas/pixelArcadeBackground'
import { PIXEL_ARCADE_COLUMN_SHAPE } from './normal'

export const pixelArcadeWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawPixelArcadeActiveLayer,
  getShape: () => PIXEL_ARCADE_COLUMN_SHAPE
}
