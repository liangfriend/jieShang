import type { PerformBackgroundCanvasCommand } from '../types'
import { drawImperialDragonBackground } from '../canvas/imperialDragonBackground'

export const imperialDragonPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawImperialDragonBackground
}
