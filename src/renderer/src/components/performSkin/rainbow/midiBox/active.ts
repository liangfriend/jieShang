import type { CSSProperties } from 'vue'
import type { MidiBoxBlockStyleInput } from '../../types'
import { getRainbowMidiBoxNormalBlockStyle } from './normal'

export function getRainbowMidiBoxActiveBlockStyle(input: MidiBoxBlockStyleInput): CSSProperties {
  const base = getRainbowMidiBoxNormalBlockStyle(input)
  const color = (base.background as string) ?? '#fff'
  return {
    ...base,
    background: `linear-gradient(180deg, #fff 0%, ${color} 100%)`,
    boxShadow: '0 0 10px 2px rgba(46, 184, 166, 0.75)'
  }
}

export function getRainbowMidiBoxKeyActiveBarStyle(input: {
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
