import type { PerformBackgroundCanvasCommand } from '../types'
import { drawSynthwaveBackground } from '../canvas/synthwaveBackground'

export const synthwavePerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawSynthwaveBackground
}
