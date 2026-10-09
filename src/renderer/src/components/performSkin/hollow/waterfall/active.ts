import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import {
  drawHollowSolidColumns,
  drawNothing,
  HOLLOW_COLUMN_RADIUS,
  HOLLOW_COLUMN_WIDTH,
  type HollowTheme
} from '../../canvas/hollowGlow'

export function createHollowWaterfallActiveColumn(
  theme: HollowTheme
): WaterfallActiveColumnCanvasCommand {
  return {
    drawBackground: drawNothing,
    drawColumns: (ctx, columns, input) => drawHollowSolidColumns(ctx, columns, input, theme),
    getShape: () => ({ width: HOLLOW_COLUMN_WIDTH, borderRadius: HOLLOW_COLUMN_RADIUS, opacity: 1 })
  }
}
