import type { PerformSkinPack } from '../types'
import { PIXEL_ARCADE_CONTAINER_BG } from '../canvas/pixelArcadeBackground'
import { pixelArcadeMidiBoxActiveBlock } from './midiBox/active'
import { pixelArcadeMidiBoxNormalBlock } from './midiBox/normal'
import { pixelArcadeWaterfallActiveColumn } from './waterfall/active'
import { pixelArcadeWaterfallNormalColumn } from './waterfall/normal'
import { pixelArcadePerformOverlay } from './overlay'
import { pixelArcadePerformBackground } from './background'

export const pixelArcadePerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '2px solid #2a1f5c',
    background: PIXEL_ARCADE_CONTAINER_BG
  },
  background: pixelArcadePerformBackground,
  midiBox: {
    normalBlock: pixelArcadeMidiBoxNormalBlock,
    activeBlock: pixelArcadeMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: pixelArcadeWaterfallNormalColumn,
    activeColumn: pixelArcadeWaterfallActiveColumn
  },
  overlay: pixelArcadePerformOverlay
}
