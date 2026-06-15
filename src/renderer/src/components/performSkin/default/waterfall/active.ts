import type { CSSProperties } from 'vue'
import type { WaterfallActiveColumnCanvasCommand } from '../../types'
import { drawSolidLayerBackground } from '../../canvas/simpleFillEffect'

const ACTIVE_COLOR = '#2196f3'

export const defaultWaterfallActiveColumn: WaterfallActiveColumnCanvasCommand = {
  drawBackground(ctx, input) {
    drawSolidLayerBackground(ctx, ACTIVE_COLOR, input)
  },
  getShape: () => ({
    width: 14,
    borderRadius: 999,
    opacity: 0.85
  })
}

export function getDefaultWaterfallKeyActiveBarStyle(input: {
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
