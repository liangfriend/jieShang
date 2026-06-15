import type { WaterfallColumnCanvasCommand } from '../../types'
import { drawRainbowNormalLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowWaterfallNormalColumn: WaterfallColumnCanvasCommand = {
  drawBackground: drawRainbowNormalLayerBackground,
  getShape: () => ({
    width: 14,
    borderRadius: 999,
    opacity: 1
  })
}
