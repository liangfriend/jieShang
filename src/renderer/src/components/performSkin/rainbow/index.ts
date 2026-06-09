import type { PerformSkinPack } from '../types'
import { bg, baseline } from './svg'
import { getRainbowMidiBoxActiveBlockStyle, getRainbowMidiBoxKeyActiveBarStyle } from './midiBox/active'
import { getRainbowMidiBoxNormalBlockStyle } from './midiBox/normal'
import {
  getRainbowWaterfallActiveColumnStyle,
  getRainbowWaterfallKeyActiveBarStyle
} from './waterfall/active'
import { getRainbowWaterfallNormalColumnStyle } from './waterfall/normal'

export const rainbowPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(255, 184, 208, 0.35)',
    boxShadow: 'inset 0 2px 10px rgba(255, 192, 220, 0.18)'
  },
  midiBox: {
    normalBlock: getRainbowMidiBoxNormalBlockStyle,
    activeBlock: getRainbowMidiBoxActiveBlockStyle,
    keyActiveBar: getRainbowMidiBoxKeyActiveBarStyle
  },
  waterfall: {
    normalColumn: getRainbowWaterfallNormalColumnStyle,
    activeColumn: getRainbowWaterfallActiveColumnStyle,
    keyActiveBar: getRainbowWaterfallKeyActiveBarStyle
  },
  baseline: {
    height: '3px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'flex-end',
    boxShadow: '0 0 12px 1px rgba(255, 158, 199, 0.6)'
  },
  bgSvg: bg,
  baselineSvg: baseline
}
