import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawSynthwaveActiveLayer } from '../../canvas/synthwaveBackground'

export const synthwaveWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawSynthwaveActiveLayer,
  getShape: () => getPerformWaterfallActiveColumnShape(1)
}
