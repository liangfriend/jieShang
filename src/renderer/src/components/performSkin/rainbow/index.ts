import type { PerformSkinPack } from '../types'
import { bg, baseline, baselineMidiActive } from './svg'
import { rainbowMidiBoxActiveBlock, getRainbowMidiBoxKeyActiveBarStyle } from './midiBox/active'
import { rainbowMidiBoxNormalBlock } from './midiBox/normal'
import { rainbowWaterfallActiveColumn, getRainbowWaterfallKeyActiveBarStyle } from './waterfall/active'
import { rainbowWaterfallNormalColumn } from './waterfall/normal'

export const rainbowPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(255, 184, 208, 0.35)',
    boxShadow: 'inset 0 2px 10px rgba(255, 192, 220, 0.18)'
  },
  midiBox: {
    normalBlock: rainbowMidiBoxNormalBlock,
    activeBlock: rainbowMidiBoxActiveBlock,
    keyActiveBar: getRainbowMidiBoxKeyActiveBarStyle
  },
  waterfall: {
    normalColumn: rainbowWaterfallNormalColumn,
    activeColumn: rainbowWaterfallActiveColumn,
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
  baselineSvg: baseline,
  baselineMidiActiveSvg: baselineMidiActive
}
