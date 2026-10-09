import type { PerformBackgroundCanvasCommand } from '../types'
import { drawSakuraBackground } from '../canvas/sakuraBackground'

export const sakuraPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawSakuraBackground
}
