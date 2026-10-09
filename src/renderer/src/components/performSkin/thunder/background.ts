import type { PerformBackgroundCanvasCommand } from '../types'
import { drawThunderBackground } from '../canvas/thunderBackground'

export const thunderPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawThunderBackground
}
