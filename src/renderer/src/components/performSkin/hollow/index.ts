import type { PerformSkinPack } from '../types'
import {
  createHollowTheme,
  drawHollowBackground,
  HOLLOW_BG,
  rgba
} from '../canvas/hollowGlow'
import { createHollowMidiBoxActiveBlock } from './midiBox/active'
import { createHollowMidiBoxNormalBlock } from './midiBox/normal'
import { createHollowWaterfallActiveColumn } from './waterfall/active'
import { createHollowWaterfallNormalColumn } from './waterfall/normal'
import { createHollowPerformOverlay } from './overlay'
import { parseHollowOption } from './option'

/** 空洞皮肤按藏品 option（渐变色标、流动速度、光晕强度）生成 */
export function createHollowPerformSkin(rawOption: string | null | undefined): PerformSkinPack {
  const theme = createHollowTheme(parseHollowOption(rawOption))
  return {
    container: {
      borderRadius: '0',
      border: `1px solid ${rgba(theme.stops[0]!.rgb, 0.4)}`,
      background: HOLLOW_BG
    },
    background: { drawBackground: drawHollowBackground },
    midiBox: {
      normalBlock: createHollowMidiBoxNormalBlock(theme),
      activeBlock: createHollowMidiBoxActiveBlock(theme)
    },
    waterfall: {
      normalColumn: createHollowWaterfallNormalColumn(theme),
      activeColumn: createHollowWaterfallActiveColumn(theme)
    },
    overlay: createHollowPerformOverlay(theme)
  }
}
