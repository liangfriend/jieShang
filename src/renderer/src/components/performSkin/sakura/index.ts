import type { PerformSkinPack } from '../types'
import { SAKURA_CONTAINER_BG } from '../canvas/sakuraBackground'
import { sakuraMidiBoxActiveBlock } from './midiBox/active'
import { sakuraMidiBoxNormalBlock } from './midiBox/normal'
import { sakuraWaterfallActiveColumn } from './waterfall/active'
import { sakuraWaterfallNormalColumn } from './waterfall/normal'
import { sakuraPerformOverlay } from './overlay'
import { sakuraPerformBackground } from './background'

export const sakuraPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(230, 120, 160, 0.3)',
    background: SAKURA_CONTAINER_BG
  },
  background: sakuraPerformBackground,
  midiBox: {
    normalBlock: sakuraMidiBoxNormalBlock,
    activeBlock: sakuraMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: sakuraWaterfallNormalColumn,
    activeColumn: sakuraWaterfallActiveColumn
  },
  overlay: sakuraPerformOverlay
}
