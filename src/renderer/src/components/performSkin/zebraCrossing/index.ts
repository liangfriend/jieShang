import type { PerformSkinPack } from '../types'
import { ZEBRA_CROSSING_CONTAINER_BG } from '../canvas/zebraCrossingRoadBackground'
import { zebraCrossingMidiBoxActiveBlock } from './midiBox/active'
import { zebraCrossingMidiBoxNormalBlock } from './midiBox/normal'
import { zebraCrossingWaterfallActiveColumn } from './waterfall/active'
import { zebraCrossingWaterfallNormalColumn } from './waterfall/normal'
import { zebraCrossingPerformOverlay } from './overlay'
import { zebraCrossingPerformBackground } from './background'

export const zebraCrossingPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(0, 0, 0, 0.18)',
    background: ZEBRA_CROSSING_CONTAINER_BG
  },
  background: zebraCrossingPerformBackground,
  midiBox: {
    normalBlock: zebraCrossingMidiBoxNormalBlock,
    activeBlock: zebraCrossingMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: zebraCrossingWaterfallNormalColumn,
    activeColumn: zebraCrossingWaterfallActiveColumn
  },
  overlay: zebraCrossingPerformOverlay
}
