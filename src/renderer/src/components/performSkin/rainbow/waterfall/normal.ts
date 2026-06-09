import type { CSSProperties } from 'vue'
import type { WaterfallColumnStyleInput } from '../../types'

function noteHue(midi: number) {
  return (midi * 17 + 285) % 360
}

export function getRainbowWaterfallNormalColumnStyle(
  input: WaterfallColumnStyleInput
): CSSProperties {
  const hue = noteHue(input.midi)
  const height = (input.end - input.start) * input.columnHeightConstant
  return {
    height: `${height}px`,
    width: '14px',
    background: `linear-gradient(180deg, hsla(${hue}, 100%, 84%, 0.98) 0%, hsla(${hue}, 85%, 70%, 0.96) 100%)`,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '999px',
    boxShadow: `0 2px 8px hsla(${hue}, 80%, 60%, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.55)`,
    bottom: `${input.start * input.columnHeightConstant}px`
  }
}
