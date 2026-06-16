import type { PerformBackgroundCanvasCommand } from '../types'
import { drawSolidLayerBackground } from '../canvas/simpleFillEffect'

export const defaultPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, '#ffffff', input)
  }
}
