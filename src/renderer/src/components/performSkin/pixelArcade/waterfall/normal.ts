import type { WaterfallColumnCanvasCommand } from '../../types'
import { drawPixelArcadeNormalLayer } from '../../canvas/pixelArcadeBackground'

/** 像素块：方角，比默认胶囊略窄 */
export const PIXEL_ARCADE_COLUMN_SHAPE = { width: 12, borderRadius: 1, opacity: 1 }

export const pixelArcadeWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawPixelArcadeNormalLayer,
  getShape: () => PIXEL_ARCADE_COLUMN_SHAPE
}
