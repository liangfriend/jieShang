import type { PerformSkinPack } from '../types'
import { PERFORM_AMBIENT_CONTAINER_BG } from '../canvas/performAmbientBackground'
import { starRiverMidiBoxActiveBlock } from './midiBox/active'
import { starRiverMidiBoxNormalBlock } from './midiBox/normal'
import { starRiverWaterfallActiveColumn } from './waterfall/active'
import { starRiverWaterfallNormalColumn } from './waterfall/normal'
import { starRiverPerformOverlay } from './overlay'
import { starRiverPerformBackground } from './background'

export const starRiverPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(140, 120, 200, 0.28)',
    background: PERFORM_AMBIENT_CONTAINER_BG
  },
  background: starRiverPerformBackground,
  midiBox: {
    normalBlock: starRiverMidiBoxNormalBlock,
    activeBlock: starRiverMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: starRiverWaterfallNormalColumn,
    activeColumn: starRiverWaterfallActiveColumn
  },
  overlay: starRiverPerformOverlay
}
