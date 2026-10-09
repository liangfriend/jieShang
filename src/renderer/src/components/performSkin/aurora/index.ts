import type { PerformSkinPack } from '../types'
import { AURORA_CONTAINER_BG } from '../canvas/auroraBackground'
import { auroraMidiBoxActiveBlock } from './midiBox/active'
import { auroraMidiBoxNormalBlock } from './midiBox/normal'
import { auroraWaterfallActiveColumn } from './waterfall/active'
import { auroraWaterfallNormalColumn } from './waterfall/normal'
import { auroraPerformOverlay } from './overlay'
import { auroraPerformBackground } from './background'

export const auroraPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(120, 230, 220, 0.35)',
    background: AURORA_CONTAINER_BG
  },
  background: auroraPerformBackground,
  midiBox: {
    normalBlock: auroraMidiBoxNormalBlock,
    activeBlock: auroraMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: auroraWaterfallNormalColumn,
    activeColumn: auroraWaterfallActiveColumn
  },
  overlay: auroraPerformOverlay
}
