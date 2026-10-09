import type { PerformSkinPack } from '../types'
import { FIREFLY_CONTAINER_BG } from '../canvas/fireflyBackground'
import { fireflyMidiBoxActiveBlock } from './midiBox/active'
import { fireflyMidiBoxNormalBlock } from './midiBox/normal'
import { fireflyWaterfallActiveColumn } from './waterfall/active'
import { fireflyWaterfallNormalColumn } from './waterfall/normal'
import { fireflyPerformOverlay } from './overlay'
import { fireflyPerformBackground } from './background'

export const fireflyPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(120, 200, 120, 0.25)',
    background: FIREFLY_CONTAINER_BG
  },
  background: fireflyPerformBackground,
  midiBox: {
    normalBlock: fireflyMidiBoxNormalBlock,
    activeBlock: fireflyMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: fireflyWaterfallNormalColumn,
    activeColumn: fireflyWaterfallActiveColumn
  },
  overlay: fireflyPerformOverlay
}
