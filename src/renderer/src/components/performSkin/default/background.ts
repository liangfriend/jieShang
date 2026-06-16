import type { PerformBackgroundCanvasCommand } from '../types'
import { drawPerformAmbientBackground } from '../canvas/performAmbientBackground'

export const defaultPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawPerformAmbientBackground
}
