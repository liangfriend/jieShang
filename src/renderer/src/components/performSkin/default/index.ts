import type { PerformSkinPack } from '../types'
import { bg, baseline, baselineMidiActive } from './svg'
import { defaultMidiBoxActiveBlock, getDefaultMidiBoxKeyActiveBarStyle } from './midiBox/active'
import { defaultMidiBoxNormalBlock } from './midiBox/normal'
import { defaultWaterfallActiveColumn, getDefaultWaterfallKeyActiveBarStyle } from './waterfall/active'
import { defaultWaterfallNormalColumn } from './waterfall/normal'

export const defaultPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: '#ffffff'
  },
  midiBox: {
    normalBlock: defaultMidiBoxNormalBlock,
    activeBlock: defaultMidiBoxActiveBlock,
    keyActiveBar: getDefaultMidiBoxKeyActiveBarStyle
  },
  waterfall: {
    normalColumn: defaultWaterfallNormalColumn,
    activeColumn: defaultWaterfallActiveColumn,
    keyActiveBar: getDefaultWaterfallKeyActiveBarStyle
  },
  baseline: {
    height: '3px',
    background: '#ff0000',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'flex-end'
  },
  bgSvg: bg,
  baselineSvg: baseline,
  baselineMidiActiveSvg: baselineMidiActive
}
