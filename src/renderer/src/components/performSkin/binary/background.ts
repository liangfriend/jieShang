import type { PerformBackgroundCanvasCommand } from '../types'
import { drawPerformAmbientBackground } from '../canvas/performAmbientBackground'

export const binaryPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawPerformAmbientBackground
}
