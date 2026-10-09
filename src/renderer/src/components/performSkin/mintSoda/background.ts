import type { PerformBackgroundCanvasCommand } from '../types'
import { drawMintSodaBackground } from '../canvas/mintSodaBackground'

export const mintSodaPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawMintSodaBackground
}
