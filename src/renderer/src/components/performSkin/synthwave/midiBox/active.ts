import type { MidiBoxBlockCanvasCommand } from '../../types'
import { getPerformMidiBoxBlockShape } from '../../shapePresets'
import { drawSynthwaveActiveLayer } from '../../canvas/synthwaveBackground'

export const synthwaveMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground: drawSynthwaveActiveLayer,
  getShape: (input) => ({ ...getPerformMidiBoxBlockShape(input.blockSize, input.fallen), borderRadius: 3 })
}
