/** 单键皮肤 SVG 片段（不含 dataurl 前缀） */
type KeySkinSvg = { normal: string; press: string }

const SVG_OPEN =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>"

/** dataurl：前缀 + encodeURIComponent(svg) */
function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const MIDI_MIN = 21
const MIDI_MAX = 108
const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10])

function isBlackKey(midi: number): boolean {
  return BLACK_OFFSETS.has(((midi % 12) + 12) % 12)
}

function buildVirtualPianoPack(white: KeySkinSvg, black: KeySkinSvg): Record<number, {
  normal: string
  press: string
  active: string
}> {
  const pack: Record<number, { normal: string; press: string; active: string }> = {}
  for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
    const src = isBlackKey(midi) ? black : white
    pack[midi] = {
      normal: svgDataUrl(src.normal),
      press: svgDataUrl(src.press),
      active: ''
    }
  }
  return pack
}

/* ---------- 经典纯色 ---------- */
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

/* ---------- 金属质感 ---------- */
const W_METAL =
  "<linearGradient id='wMetal' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#f5f5f5'/><stop offset='35%' stop-color='#c8c8c8'/><stop offset='72%' stop-color='#909090'/><stop offset='100%' stop-color='#686868'/></linearGradient>"
const W_SHINE =
  "<linearGradient id='wShine' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='#ffffff' stop-opacity='0'/><stop offset='42%' stop-color='#ffffff' stop-opacity='0.45'/><stop offset='58%' stop-color='#ffffff' stop-opacity='0.12'/><stop offset='100%' stop-color='#ffffff' stop-opacity='0'/></linearGradient>"
const W_PRESS =
  "<linearGradient id='wPress' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#fff8ee'/><stop offset='35%' stop-color='#e8cfa8'/><stop offset='70%' stop-color='#c9a06a'/><stop offset='100%' stop-color='#9a7348'/></linearGradient>"
const W_PRESS_SHINE =
  "<linearGradient id='wPressShine' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='#ffffff' stop-opacity='0'/><stop offset='50%' stop-color='#fff5dc' stop-opacity='0.55'/><stop offset='100%' stop-color='#ffffff' stop-opacity='0'/></linearGradient>"

const B_METAL =
  "<linearGradient id='bMetal' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#5a5a5a'/><stop offset='40%' stop-color='#2a2a2a'/><stop offset='100%' stop-color='#101010'/></linearGradient>"
const B_SHINE =
  "<linearGradient id='bShine' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='#ffffff' stop-opacity='0'/><stop offset='50%' stop-color='#ffffff' stop-opacity='0.22'/><stop offset='100%' stop-color='#ffffff' stop-opacity='0'/></linearGradient>"
const B_PRESS =
  "<linearGradient id='bPress' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#7a6548'/><stop offset='45%' stop-color='#b8924f'/><stop offset='100%' stop-color='#4a3d2e'/></linearGradient>"
const B_PRESS_EDGE =
  "<linearGradient id='bPressEdge' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#d4b878' stop-opacity='0.6'/><stop offset='100%' stop-color='#d4b878' stop-opacity='0'/></linearGradient>"

const METAL_WHITE: KeySkinSvg = {
  normal: `${SVG_OPEN}<defs>${W_METAL}${W_SHINE}</defs><rect x='1' y='1' width='98' height='98' fill='url(#wMetal)' stroke='#666666' stroke-width='2'/><rect x='12' y='6' width='30' height='50' rx='3' fill='url(#wShine)' opacity='0.65'/></svg>`,
  press: `${SVG_OPEN}<defs>${W_PRESS}${W_PRESS_SHINE}</defs><rect x='1' y='1' width='98' height='98' fill='url(#wPress)' stroke='#a08050' stroke-width='2'/><rect x='12' y='6' width='30' height='50' rx='3' fill='url(#wPressShine)' opacity='0.75'/></svg>`
}

const METAL_BLACK: KeySkinSvg = {
  normal: `${SVG_OPEN}<defs>${B_METAL}${B_SHINE}</defs><rect x='3' y='0' width='94' height='96' rx='6' fill='url(#bMetal)'/><rect x='12' y='5' width='40' height='34' rx='3' fill='url(#bShine)' opacity='0.7'/></svg>`,
  press: `${SVG_OPEN}<defs>${B_PRESS}${B_PRESS_EDGE}</defs><rect x='3' y='0' width='94' height='96' rx='6' fill='url(#bPress)' stroke='#c9a85c' stroke-width='1.5'/><rect x='8' y='2' width='84' height='12' rx='2' fill='url(#bPressEdge)'/></svg>`
}

/** 金属质感：白键 / 黑键各一套，按 midi 展开；按下态为暖金铜色而非纯蓝 */
export function buildMetalGlossPianoPack() {
  return buildVirtualPianoPack(METAL_WHITE, METAL_BLACK)
}
