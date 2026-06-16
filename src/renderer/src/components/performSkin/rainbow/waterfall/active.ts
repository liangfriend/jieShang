import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { drawRainbowActiveLayerBackground } from '../../canvas/rainbowGradientEffect'

export const rainbowWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground: drawRainbowActiveLayerBackground,
  getShape: () => ({
    width: 14,
    borderRadius: 999,
    opacity: 0.85
  })
}
