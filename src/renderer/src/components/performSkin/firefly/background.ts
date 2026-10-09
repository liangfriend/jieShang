import type { PerformBackgroundCanvasCommand } from '../types'
import { drawFireflyBackground } from '../canvas/fireflyBackground'

export const fireflyPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawFireflyBackground
}
