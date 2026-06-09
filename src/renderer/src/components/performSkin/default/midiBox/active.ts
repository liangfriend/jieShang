import type { CSSProperties } from 'vue'
import type { MidiBoxBlockStyleInput } from '../../types'
import { getDefaultMidiBoxNormalBlockStyle } from './normal'

const ACTIVE_COLOR = '#2196f3'

export function getDefaultMidiBoxActiveBlockStyle(input: MidiBoxBlockStyleInput): CSSProperties {
  const base = getDefaultMidiBoxNormalBlockStyle(input)
  return {
    ...base,
    background: ACTIVE_COLOR,
    boxShadow: '0 0 8px 2px rgba(33, 150, 243, 0.65)'
  }
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
