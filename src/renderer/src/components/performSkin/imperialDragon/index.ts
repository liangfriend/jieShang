import type { PerformSkinPack } from '../types'
import { IMPERIAL_DRAGON_CONTAINER_BG } from '../canvas/imperialDragonBackground'
import { imperialDragonMidiBoxActiveBlock } from './midiBox/active'
import { imperialDragonMidiBoxNormalBlock } from './midiBox/normal'
import { imperialDragonWaterfallActiveColumn } from './waterfall/active'
import { imperialDragonWaterfallNormalColumn } from './waterfall/normal'
import { imperialDragonPerformOverlay } from './overlay'
import { imperialDragonPerformBackground } from './background'

export const imperialDragonPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '2px solid #b8860b',
    background: IMPERIAL_DRAGON_CONTAINER_BG
  },
  background: imperialDragonPerformBackground,
  midiBox: {
    normalBlock: imperialDragonMidiBoxNormalBlock,
    activeBlock: imperialDragonMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: imperialDragonWaterfallNormalColumn,
    activeColumn: imperialDragonWaterfallActiveColumn
  },
  overlay: imperialDragonPerformOverlay
}
