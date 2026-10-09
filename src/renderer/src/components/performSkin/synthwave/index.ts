import type { PerformSkinPack } from '../types'
import { SYNTHWAVE_CONTAINER_BG } from '../canvas/synthwaveBackground'
import { synthwaveMidiBoxActiveBlock } from './midiBox/active'
import { synthwaveMidiBoxNormalBlock } from './midiBox/normal'
import { synthwaveWaterfallActiveColumn } from './waterfall/active'
import { synthwaveWaterfallNormalColumn } from './waterfall/normal'
import { synthwavePerformOverlay } from './overlay'
import { synthwavePerformBackground } from './background'

export const synthwavePerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(255, 90, 224, 0.45)',
    background: SYNTHWAVE_CONTAINER_BG
  },
  background: synthwavePerformBackground,
  midiBox: {
    normalBlock: synthwaveMidiBoxNormalBlock,
    activeBlock: synthwaveMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: synthwaveWaterfallNormalColumn,
    activeColumn: synthwaveWaterfallActiveColumn
  },
  overlay: synthwavePerformOverlay
}
