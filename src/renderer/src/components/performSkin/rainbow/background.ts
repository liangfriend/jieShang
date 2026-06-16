import type { PerformBackgroundCanvasCommand } from '../types'
import { drawPerformAmbientBackground } from '../canvas/performAmbientBackground'

export const rainbowPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawPerformAmbientBackground
}
