/**
 * 手册专用的 Markdown 子集：
 * `##`~`####` 标题、段落、`-` / `1.` 列表（两空格缩进嵌套）、`>` 提示框、表格、``` 代码块；
 * 行内 `**粗体**`、`` `代码` ``、`[文字](#页面id)` 站内跳转。
 * 独占一行的 `![说明](文件名)` 渲染为插图，文件放在 `assets/manual/`。
 * 表格单元格里的竖线写作 `\|`。
 */

const IMAGE_URLS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../../assets/manual/*.{png,jpg,jpeg,svg,webp}', {
      query: '?url',
      import: 'default',
      eager: true
    }) as Record<string, string>
  ).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1), url])
)

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
}

function renderInline(text: string): string {
  const codes: string[] = []
  let s = text.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(code)
    return `\u0000${codes.length - 1}\u0000`
  })
  s = escapeHtml(s)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(
    /\[([^\]]+)\]\(#([\w-]+)\)/g,
    '<a class="manual-link" role="link" tabindex="0" data-page="$2">$1</a>'
  )
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${escapeHtml(codes[Number(i)])}</code>`)
}

const LIST_ITEM_RE = /^(\s*)([-*]|\d+\.)\s+(.*)$/
const HEADING_RE = /^(#{1,4})\s+(.*)$/
const TABLE_SEP_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/

function isBlockStart(line: string, next: string | undefined): boolean {
  const s = line.trim()
  return (
    s === '' ||
    s.startsWith('```') ||
    s.startsWith('>') ||
    IMAGE_RE.test(s) ||
    HEADING_RE.test(s) ||
    LIST_ITEM_RE.test(line) ||
    (s.startsWith('|') && next !== undefined && TABLE_SEP_RE.test(next))
  )
}

function splitRow(line: string): string[] {
  let s = line.trim()
  if (s.startsWith('|')) s = s.slice(1)
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1)
  return s.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'))
}

interface ListItem {
  indent: number
  ordered: boolean
  start: number
  text: string
}

function renderList(items: ListItem[], from: number, indent: number): [string, number] {
  const { ordered, start } = items[from]
  const tag = ordered ? 'ol' : 'ul'
  let html = ordered && start !== 1 ? `<ol start="${start}">` : `<${tag}>`
  let i = from
  while (i < items.length && items[i].indent >= indent) {
    html += `<li>${renderInline(items[i].text)}`
    i++
    if (i < items.length && items[i].indent > indent) {
      const [sub, next] = renderList(items, i, items[i].indent)
      html += sub
      i = next
    }
    html += '</li>'
  }
  return [`${html}</${tag}>`, i]
}

export function renderManualMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      i++
      continue
    }

    if (trimmed.startsWith('```')) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i++])
      i++
      out.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`)
      continue
    }

    const image = IMAGE_RE.exec(trimmed)
    if (image) {
      const [, alt, file] = image
      const src = IMAGE_URLS[file]
      if (src) {
        const caption = alt ? `<figcaption>${renderInline(alt)}</figcaption>` : ''
        out.push(
          `<figure class="manual-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${caption}</figure>`
        )
      }
      i++
      continue
    }

    const heading = HEADING_RE.exec(trimmed)
    if (heading) {
      const level = Math.min(Math.max(heading[1].length, 2), 4)
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      i++
      continue
    }

    if (trimmed.startsWith('>')) {
      const body: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        body.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      out.push(`<div class="manual-tip">${renderManualMarkdown(body.join('\n'))}</div>`)
      continue
    }

    if (trimmed.startsWith('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      const head = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]))
      const thead = head.map((c) => `<th>${renderInline(c)}</th>`).join('')
      const tbody = rows
        .map((r) => `<tr>${head.map((_, k) => `<td>${renderInline(r[k] ?? '')}</td>`).join('')}</tr>`)
        .join('')
      out.push(`<div class="manual-table"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`)
      continue
    }

    if (LIST_ITEM_RE.test(line)) {
      const items: ListItem[] = []
      while (i < lines.length) {
        const m = LIST_ITEM_RE.exec(lines[i])
        if (!m) break
        items.push({
          indent: m[1].replace(/\t/g, '  ').length,
          ordered: m[2] !== '-' && m[2] !== '*',
          start: Number.parseInt(m[2], 10) || 1,
          text: m[3]
        })
        i++
      }
      let k = 0
      while (k < items.length) {
        const [html, next] = renderList(items, k, items[k].indent)
        out.push(html)
        k = next
      }
      continue
    }

    const para: string[] = [trimmed]
    i++
    while (i < lines.length && !isBlockStart(lines[i], lines[i + 1])) para.push(lines[i++].trim())
    out.push(`<p>${renderInline(para.join(''))}</p>`)
  }

  return out.join('\n')
}
