import type { CSSProperties } from 'vue'
import type { MidiBoxBlockStyleInput } from '../../types'

const BLOCK_PALETTE = [
  'hsl(350, 88%, 72%)',
  'hsl(280, 78%, 72%)',
  'hsl(200, 82%, 68%)',
  'hsl(145, 70%, 62%)',
  'hsl(45, 90%, 68%)',
  'hsl(15, 85%, 68%)',
  'hsl(320, 75%, 70%)',
  'hsl(250, 70%, 72%)'
] as const

function blockColor(midi: number, batchIndex: number) {
  const idx = (batchIndex * 5 + midi) % BLOCK_PALETTE.length
  return BLOCK_PALETTE[idx]
}

export function getRainbowMidiBoxNormalBlockStyle(input: MidiBoxBlockStyleInput): CSSProperties {
  const color = blockColor(input.midi, input.batchIndex)
  return {
    width: `${input.blockSize}px`,
    height: `${input.blockSize}px`,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '3px',
    bottom: `${input.baseLineBottom + input.batchIndex * input.blockStride}px`,
    background: color,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
    opacity: input.fallen ? 0.35 : 1,
    transition: `opacity ${input.fallDuration}s ease, box-shadow 0.1s ease`
  }
}
