import type { CSSProperties } from 'vue'
import type { MidiBoxBlockCanvasCommand } from '../../types'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const ACTIVE_COLOR = '#2196f3'

export const defaultMidiBoxActiveBlock: MidiBoxBlockCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, ACTIVE_COLOR, input)
  },
  getShape: (input) => ({
    width: input.blockSize,
    borderRadius: 3,
    opacity: input.fallen ? 0.35 : 1
  })
}

export function getDefaultMidiBoxKeyActiveBarStyle(input: {
  width: number
  active: boolean
}): CSSProperties {
  return {
    width: `${input.width}px`,
    flexShrink: 0,
    height: input.active ? '6px' : '0.1px',
    borderRadius: '999px',
    transform: 'translateY(-3px)',
    transition: 'height 0.1s ease',
    visibility: input.active ? 'visible' : 'hidden'
  }
}
