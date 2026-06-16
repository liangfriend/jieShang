import type { PerformBackgroundCanvasCommand } from '../types'
import { drawZebraCrossingRoadBackground } from '../canvas/zebraCrossingRoadBackground'

export const zebraCrossingPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawZebraCrossingRoadBackground
}
