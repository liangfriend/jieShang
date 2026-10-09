import type { PerformBackgroundCanvasCommand } from '../types'
import { drawPixelArcadeBackground } from '../canvas/pixelArcadeBackground'

export const pixelArcadePerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawPixelArcadeBackground
}
