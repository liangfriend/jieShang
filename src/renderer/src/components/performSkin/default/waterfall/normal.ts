import type { WaterfallColumnCanvasCommand } from '../../types'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const NORMAL_COLOR = '#ffeb3b'

export const defaultWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, NORMAL_COLOR, input)
  },
  getShape: () => ({
    width: 14,
    borderRadius: 999,
    opacity: 1
  })
}
