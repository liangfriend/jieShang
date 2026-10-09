import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawHollowSolidColumns, drawNothing, type HollowTheme } from '../../canvas/hollowGlow'

export function createHollowMidiBoxActiveBlock(theme: HollowTheme): MidiBoxBlockCanvasCommand {
  return {
    drawBackground: drawNothing,
    drawColumns: (ctx, columns, input) => drawHollowSolidColumns(ctx, columns, input, theme),
    getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
  }
}
