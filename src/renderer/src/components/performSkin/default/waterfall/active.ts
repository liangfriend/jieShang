import type { CSSProperties } from 'vue'
import type { WaterfallActiveColumnStyleInput } from '../../types'

const ACTIVE_COLOR = '#2196f3'

export function getDefaultWaterfallActiveColumnStyle(
  input: WaterfallActiveColumnStyleInput
): CSSProperties {
  const height = (input.end - input.start) * input.columnHeightConstant
  return {
    height: `${height}px`,
    width: '14px',
    background: ACTIVE_COLOR,
    opacity: 0.85,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '999px',
    bottom: `${input.start * input.columnHeightConstant}px`
  }
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
    background: ACTIVE_COLOR,
    transform: 'translateY(-3px)',
    transition: 'height 0.1s ease',
    visibility: input.active ? 'visible' : 'hidden'
  }
}
