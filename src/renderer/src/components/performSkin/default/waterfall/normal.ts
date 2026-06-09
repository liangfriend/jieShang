import type { CSSProperties } from 'vue'
import type { WaterfallColumnStyleInput } from '../../types'

const NORMAL_COLOR = '#ffeb3b'

export function getDefaultWaterfallNormalColumnStyle(
  input: WaterfallColumnStyleInput
): CSSProperties {
  const height = (input.end - input.start) * input.columnHeightConstant
  return {
    height: `${height}px`,
    width: '14px',
    background: NORMAL_COLOR,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '999px',
    bottom: `${input.start * input.columnHeightConstant}px`
  }
}
