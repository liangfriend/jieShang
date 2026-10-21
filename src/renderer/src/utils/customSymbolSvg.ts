import { applySkinContentTemplate } from '@deciphony/renderer'

const SVG_NS = 'http://www.w3.org/2000/svg'
const BLOCKED_TAGS = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'metadata']
const SIZE_ATTR_RE = /\s(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

export type ParsedSymbolSvg = {
  /** 整段 <svg viewBox=…>，无 width / height（渲染时由皮肤项 w / h 决定） */
  content: string
  /** viewBox 宽高比 = 宽 / 高 */
  aspect: number
}

function parseViewBox(raw: string | null): [number, number, number, number] | null {
  if (!raw) return null
  const parts = raw.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null
  const [x, y, w, h] = parts as [number, number, number, number]
  return w > 0 && h > 0 ? [x, y, w, h] : null
}

function parseLength(raw: string | null): number | null {
  if (!raw || raw.trim().endsWith('%')) return null
  const n = parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** 去掉脚本、外部引用与事件属性，只留纯绘图内容 */
function sanitize(root: Element): void {
  for (const tag of BLOCKED_TAGS) {
    root.querySelectorAll(tag).forEach((el) => el.remove())
  }
  const all = [root, ...Array.from(root.querySelectorAll('*'))]
  for (const el of all) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (name.startsWith('on')) el.removeAttribute(attr.name)
      else if ((name === 'href' || name === 'xlink:href') && !value.startsWith('#') && !value.startsWith('data:image/')) {
        el.removeAttribute(attr.name)
      }
    }
  }
}

/** 没有 viewBox / 宽高时挂到文档里量包围盒 */
function measureBBox(root: SVGSVGElement): [number, number, number, number] | null {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden'
  const clone = document.importNode(root, true) as SVGSVGElement
  host.appendChild(clone)
  document.body.appendChild(host)
  try {
    const box = clone.getBBox()
    return box.width > 0 && box.height > 0 ? [box.x, box.y, box.width, box.height] : null
  } catch {
    return null
  } finally {
    host.remove()
  }
}

/** 解析上传的 svg 文本；不是合法 svg 或量不出尺寸时抛错 */
export function parseSymbolSvg(text: string): ParsedSymbolSvg {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  const root = doc.documentElement
  if (doc.querySelector('parsererror') || root.localName !== 'svg' || root.namespaceURI !== SVG_NS) {
    throw new Error('invalid svg')
  }
  sanitize(root)
  const svg = root as unknown as SVGSVGElement
  let viewBox = parseViewBox(svg.getAttribute('viewBox'))
  if (!viewBox) {
    const w = parseLength(svg.getAttribute('width'))
    const h = parseLength(svg.getAttribute('height'))
    viewBox = w && h ? [0, 0, w, h] : measureBBox(svg)
  }
  if (!viewBox) throw new Error('svg has no size')
  svg.setAttribute('viewBox', viewBox.join(' '))
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  // 宽高由皮肤项 w / h 决定，取消比例锁定时允许拉伸
  svg.setAttribute('preserveAspectRatio', 'none')
  return {
    content: new XMLSerializer().serializeToString(svg),
    aspect: viewBox[2] / viewBox[3]
  }
}

/** 按皮肤项 w × h 展开的预览片段，与 renderer Group 的处理一致 */
export function customSymbolMarkup(content: string, w: number, h: number): string {
  return applySkinContentTemplate(content, { w, h }).replace(
    /<svg([^>]*)>/i,
    (_, attrs: string) => `<svg${attrs.replace(SIZE_ATTR_RE, '')} width="${w}" height="${h}">`
  )
}
