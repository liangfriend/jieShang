import type { CSSProperties } from 'vue'
import type { WaterfallActiveColumnStyleInput } from '../../types'

export function getRainbowWaterfallActiveColumnStyle(
  input: WaterfallActiveColumnStyleInput
): CSSProperties {
  const height = (input.end - input.start) * input.columnHeightConstant
  return {
    height: `${height}px`,
    width: '14px',
    background: 'linear-gradient(180deg, #7ee8fa 0%, #4dd4c4 50%, #2eb8a6 100%)',
    opacity: 0.7,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '999px',
    bottom: `${input.start * input.columnHeightConstant}px`
  }
}

export function getRainbowWaterfallKeyActiveBarStyle(input: {
  width: number
  active: boolean
}): CSSProperties {
  return {
    width: `${input.width}px`,
    flexShrink: 0,
    height: input.active ? '6px' : '0.1px',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #ffd1e8, #ff9ec7, #c9b8ff)',
    boxShadow: '0 0 10px 2px rgba(255, 143, 184, 0.85)',
    transform: 'translateY(-3px)',
    transition: 'height 0.1s ease',
    visibility: input.active ? 'visible' : 'hidden'
  }
}
