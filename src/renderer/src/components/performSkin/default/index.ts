import type { PerformSkinPack } from '../types'
import { bg, baseline, baselineMidiActive } from './svg'
import { getDefaultMidiBoxActiveBlockStyle, getDefaultMidiBoxKeyActiveBarStyle } from './midiBox/active'
import { getDefaultMidiBoxNormalBlockStyle } from './midiBox/normal'
import {
  getDefaultWaterfallActiveColumnStyle,
  getDefaultWaterfallKeyActiveBarStyle
} from './waterfall/active'
import { getDefaultWaterfallNormalColumnStyle } from './waterfall/normal'

export const defaultPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: '#ffffff'
  },
  midiBox: {
    normalBlock: getDefaultMidiBoxNormalBlockStyle,
    activeBlock: getDefaultMidiBoxActiveBlockStyle,
    keyActiveBar: getDefaultMidiBoxKeyActiveBarStyle
  },
  waterfall: {
    normalColumn: getDefaultWaterfallNormalColumnStyle,
    activeColumn: getDefaultWaterfallActiveColumnStyle,
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
