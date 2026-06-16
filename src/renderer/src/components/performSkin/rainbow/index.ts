import type { PerformSkinPack } from '../types'
import { rainbowMidiBoxActiveBlock } from './midiBox/active'
import { rainbowMidiBoxNormalBlock } from './midiBox/normal'
import { rainbowWaterfallActiveColumn } from './waterfall/active'
import { rainbowWaterfallNormalColumn } from './waterfall/normal'
import { rainbowPerformOverlay } from './overlay'

export const rainbowPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(255, 184, 208, 0.35)',
    boxShadow: 'inset 0 2px 10px rgba(255, 192, 220, 0.18)',
    background:
      'linear-gradient(180deg, rgba(255,248,252,0.96) 0%, rgba(245,238,255,0.94) 55%, rgba(234,245,255,0.92) 100%)'
  },
  midiBox: {
    normalBlock: rainbowMidiBoxNormalBlock,
    activeBlock: rainbowMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: rainbowWaterfallNormalColumn,
    activeColumn: rainbowWaterfallActiveColumn
  },
  overlay: rainbowPerformOverlay
}
