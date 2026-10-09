import { nextTick, onBeforeUnmount, ref } from 'vue'

/** 铺满整谱的背景类元素不计入内容范围 */
const FULL_COVER_RATIO = 0.95

/** 曲谱 svg 内实际绘制内容的纵向范围（svg 用户坐标），无内容时返回 null */
export function measureScoreInkY(svg: SVGSVGElement): { top: number; bottom: number } | null {
  const svgRect = svg.getBoundingClientRect()
  const svgH = svg.viewBox.baseVal?.height || svg.height.baseVal.value
  if (!svgRect.height || !svgH) return null
  const scale = svgH / svgRect.height
  let top = Infinity
  let bottom = -Infinity
  for (const child of Array.from(svg.children)) {
    if (child.hasAttribute('data-test')) continue
    const rect = child.getBoundingClientRect()
    if (!rect.width && !rect.height) continue
    if (rect.height >= svgRect.height * FULL_COVER_RATIO && rect.width >= svgRect.width * FULL_COVER_RATIO) {
      continue
    }
    top = Math.min(top, rect.top)
    bottom = Math.max(bottom, rect.bottom)
  }
  if (!Number.isFinite(top)) return null
  return { top: (top - svgRect.top) * scale, bottom: (bottom - svgRect.top) * scale }
}

/**
 * 单行模式：按实际绘制内容把曲谱在自身高度内垂直居中，返回需要施加的 translateY。
 * 在 renderMusicScore 后调用 recenter()。
 */
export function useSingleLineScoreCenter(getSvg: () => SVGSVGElement | null | undefined) {
  const offsetY = ref(0)
  let frame = 0

  function recenter() {
    cancelAnimationFrame(frame)
    void nextTick(() => {
      frame = requestAnimationFrame(() => {
        const svg = getSvg()
        if (!svg) return
        const ink = measureScoreInkY(svg)
        if (!ink) {
          offsetY.value = 0
          return
        }
        const svgH = svg.viewBox.baseVal?.height || svg.height.baseVal.value
        offsetY.value = Math.round(svgH / 2 - (ink.top + ink.bottom) / 2)
      })
    })
  }

  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return { offsetY, recenter }
}
