import type { PerformSkinPack } from '../types'
import { PERFORM_AMBIENT_CONTAINER_BG } from '../canvas/performAmbientBackground'
import { defaultMidiBoxActiveBlock } from './midiBox/active'
import { defaultMidiBoxNormalBlock } from './midiBox/normal'
import { defaultWaterfallActiveColumn } from './waterfall/active'
import { defaultWaterfallNormalColumn } from './waterfall/normal'
import { defaultPerformOverlay } from './overlay'
import { defaultPerformBackground } from './background'

export const defaultPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: PERFORM_AMBIENT_CONTAINER_BG
  },
  background: defaultPerformBackground,
  midiBox: {
    normalBlock: defaultMidiBoxNormalBlock,
    activeBlock: defaultMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: defaultWaterfallNormalColumn,
    activeColumn: defaultWaterfallActiveColumn
  },
  overlay: defaultPerformOverlay
}
