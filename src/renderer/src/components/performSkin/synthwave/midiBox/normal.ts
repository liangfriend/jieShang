import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawSynthwaveNormalLayer } from '../../canvas/synthwaveBackground'

export const synthwaveMidiBoxNormalBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawSynthwaveNormalLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 3 })
}
