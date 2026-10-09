import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { getPerformWaterfallActiveColumnShape } from '../../shapePresets'
import { drawImperialDragonActiveLayer } from '../../canvas/imperialDragonBackground'

export const imperialDragonWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawImperialDragonActiveLayer,
  getShape: () => ({ ...getPerformWaterfallActiveColumnShape(1), borderRadius: 4 })
}
