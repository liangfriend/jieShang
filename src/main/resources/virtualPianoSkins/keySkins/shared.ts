/** 单键皮肤 SVG 片段（不含 dataurl 前缀） */
export type KeySkinSvg = { normal: string; press: string }

export function wrapKeySkinSvg(viewBox: string, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none" fill="none" shape-rendering="geometricPrecision">${inner}</svg>`
}

export const MIDI_MIN = 21
export const MIDI_MAX = 108
const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10])

export function isBlackKey(midi: number): boolean {
  return BLACK_OFFSETS.has(((midi % 12) + 12) % 12)
}

/** dataurl：前缀 + encodeURIComponent(svg) */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function buildVirtualPianoPack(white: KeySkinSvg, black: KeySkinSvg) {
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
