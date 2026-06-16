import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const ACTIVE_COLOR = '#2196f3'

export const defaultWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, ACTIVE_COLOR, input)
  },
  getShape: () => ({
    width: 14,
    borderRadius: 999,
    opacity: 0.85
  })
}
