import type { PerformBackgroundCanvasCommand } from '../types'
import { drawAuroraBackground } from '../canvas/auroraBackground'

export const auroraPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawAuroraBackground
}
