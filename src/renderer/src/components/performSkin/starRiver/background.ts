import type { PerformBackgroundCanvasCommand } from '../types'
import { drawStarRiverGalaxyBackground } from '../canvas/starRiverGalaxyBackground'

export const starRiverPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawStarRiverGalaxyBackground
}
