import type { WaterfallColumnCanvasCommand } from '../../types'
import {
  drawHollowFrames,
  drawNothing,
  HOLLOW_COLUMN_RADIUS,
  HOLLOW_COLUMN_WIDTH,
  type HollowTheme
} from '../../canvas/hollowGlow'

export function createHollowWaterfallNormalColumn(theme: HollowTheme): WaterfallColumnCanvasCommand {
  return {
    drawBackground: drawNothing,
    drawColumns: (ctx, columns, input) => drawHollowFrames(ctx, columns, input, theme),
    getShape: () => ({ width: HOLLOW_COLUMN_WIDTH, borderRadius: HOLLOW_COLUMN_RADIUS, opacity: 1 })
  }
}
