import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawHollowFrames, drawNothing, type HollowTheme } from '../../canvas/hollowGlow'

export function createHollowMidiBoxNormalBlock(theme: HollowTheme): MidiBoxBlockCanvasCommand {
  return {
    drawBackground: drawNothing,
    drawColumns: (ctx, columns, input) => drawHollowFrames(ctx, columns, input, theme),
    getShape: (input) => getPerformMidiBoxBlockShape(input.blockSize, input.fallen)
  }
}
