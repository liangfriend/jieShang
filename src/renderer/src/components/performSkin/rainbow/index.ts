import type { PerformSkinPack } from '../types'
import { bg } from './svg'
import { rainbowMidiBoxActiveBlock } from './midiBox/active'
import { rainbowMidiBoxNormalBlock } from './midiBox/normal'
import { rainbowWaterfallActiveColumn } from './waterfall/active'
import { rainbowWaterfallNormalColumn } from './waterfall/normal'
import { rainbowPerformOverlay } from './overlay'

export const rainbowPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(255, 184, 208, 0.35)',
    boxShadow: 'inset 0 2px 10px rgba(255, 192, 220, 0.18)'
  },
  midiBox: {
    normalBlock: rainbowMidiBoxNormalBlock,
    activeBlock: rainbowMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: rainbowWaterfallNormalColumn,
    activeColumn: rainbowWaterfallActiveColumn
  },
  overlay: rainbowPerformOverlay,
  bgSvg: bg
}
