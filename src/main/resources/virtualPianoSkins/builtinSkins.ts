import { buildVirtualPianoPack, type KeySkinSvg, wrapKeySkinSvg } from './keySkins/shared'
import { buildHeavyMetalPianoPack } from './keySkins/heavyMetal'
import { buildMonoChromePianoPack } from './keySkins/monoChrome'
import { buildWoodBoardPianoPack } from './keySkins/woodBoard'

export {
  buildHeavyMetalPianoPack,
  buildMonoChromePianoPack,
  buildWoodBoardPianoPack
}

const SVG_OPEN =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>"

/* ---------- 经典纯色（保留旧版简洁矩形） ---------- */
const CLASSIC_WHITE: KeySkinSvg = {
  normal: `${SVG_OPEN}<rect x='1' y='1' width='98' height='98' fill='#ffffff' stroke='#c8c8c8' stroke-width='2'/></svg>`,
  press: `${SVG_OPEN}<rect x='1' y='1' width='98' height='98' fill='#a8d8ff' stroke='#8ec4ef' stroke-width='2'/></svg>`
}

const CLASSIC_BLACK: KeySkinSvg = {
  normal: `${SVG_OPEN}<rect x='3' y='0' width='94' height='96' rx='6' fill='#111111'/></svg>`,
  press: `${SVG_OPEN}<rect x='3' y='0' width='94' height='96' rx='6' fill='#3399ff'/></svg>`
}

/** 经典纯色：白键 / 黑键各一套，按 midi 展开 */
export function buildClassicPurePianoPack() {
  return buildVirtualPianoPack(CLASSIC_WHITE, CLASSIC_BLACK)
}

/** @deprecated 使用 buildHeavyMetalPianoPack */
export function buildMetalGlossPianoPack() {
  return buildHeavyMetalPianoPack()
}
