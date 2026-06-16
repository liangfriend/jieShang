import type { PerformSkinPack } from '../types'
import { PERFORM_AMBIENT_CONTAINER_BG } from '../canvas/performAmbientBackground'
import { binaryMidiBoxActiveBlock } from './midiBox/active'
import { binaryMidiBoxNormalBlock } from './midiBox/normal'
import { binaryWaterfallActiveColumn } from './waterfall/active'
import { binaryWaterfallNormalColumn } from './waterfall/normal'
import { binaryPerformOverlay } from './overlay'
import { binaryPerformBackground } from './background'

export const binaryPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(107, 228, 69, 0.22)',
    background: PERFORM_AMBIENT_CONTAINER_BG
  },
  background: binaryPerformBackground,
  midiBox: {
    normalBlock: binaryMidiBoxNormalBlock,
    activeBlock: binaryMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: binaryWaterfallNormalColumn,
    activeColumn: binaryWaterfallActiveColumn
  },
  overlay: binaryPerformOverlay
}
