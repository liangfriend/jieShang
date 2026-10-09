import type { PerformSkinPack } from '../types'
import { MINT_SODA_CONTAINER_BG } from '../canvas/mintSodaBackground'
import { mintSodaMidiBoxActiveBlock } from './midiBox/active'
import { mintSodaMidiBoxNormalBlock } from './midiBox/normal'
import { mintSodaWaterfallActiveColumn } from './waterfall/active'
import { mintSodaWaterfallNormalColumn } from './waterfall/normal'
import { mintSodaPerformOverlay } from './overlay'
import { mintSodaPerformBackground } from './background'

export const mintSodaPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(31, 174, 156, 0.35)',
    background: MINT_SODA_CONTAINER_BG
  },
  background: mintSodaPerformBackground,
  midiBox: {
    normalBlock: mintSodaMidiBoxNormalBlock,
    activeBlock: mintSodaMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: mintSodaWaterfallNormalColumn,
    activeColumn: mintSodaWaterfallActiveColumn
  },
  overlay: mintSodaPerformOverlay
}
