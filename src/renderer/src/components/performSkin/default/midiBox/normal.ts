import type { CSSProperties } from 'vue'
import type { MidiBoxBlockStyleInput } from '../../types'

const NORMAL_COLOR = '#ffeb3b'

export function getDefaultMidiBoxNormalBlockStyle(input: MidiBoxBlockStyleInput): CSSProperties {
  return {
    width: `${input.blockSize}px`,
    height: `${input.blockSize}px`,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '3px',
    bottom: `${input.baseLineBottom + input.batchIndex * input.blockStride}px`,
    background: NORMAL_COLOR,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
    opacity: input.fallen ? 0.35 : 1,
    transition: `opacity ${input.fallDuration}s ease`
  }
}
