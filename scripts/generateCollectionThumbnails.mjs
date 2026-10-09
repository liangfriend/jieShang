import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../resources/collection-thumbnails')

function card(bg, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" fill="${bg}"/>
  ${inner}
</svg>`
}

function staffLines(color, y0 = 18, gap = 5) {
  return Array.from({ length: 5 }, (_, i) => {
    const y = y0 + i * gap
    return `<line x1="10" y1="${y}" x2="54" y2="${y}" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>`
  }).join('\n  ')
}

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** 64px 卡片宽度内放下：超长名称按空格 / 括号拆两行，再按最长行缩小字号 */
function splitLabel(text) {
  if (text.length <= 5) return [text]
  const space = text.lastIndexOf(' ')
  if (space > 0) return [text.slice(0, space), text.slice(space + 1)]
  const paren = text.search(/[（(「]/)
  if (paren > 0) return [text.slice(0, paren), text.slice(paren)]
  const mid = Math.ceil(text.length / 2)
  return [text.slice(0, mid), text.slice(mid)]
}

function toneColorLabel(text, bg, color = '#333') {
  const lines = splitLabel(text)
  const longest = Math.max(...lines.map((l) => l.length))
  const fontSize = Math.min(10, Math.floor(54 / longest))
  const lineHeight = fontSize + 3
  const firstY = 32 + fontSize / 2 - ((lines.length - 1) * lineHeight) / 2
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="32" y="${(firstY + i * lineHeight).toFixed(1)}">${escapeXml(line)}</tspan>`
    )
    .join('')
  return card(bg, `
  <text text-anchor="middle" fill="${color}" font-family="system-ui, 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="600">${tspans}</text>`)
}

/** 名单内音色按乐器族配色 [背景, 文字] */
const TONE_FAMILY_COLORS = {
  piano: ['#F3E8DC', '#5A3E2B'],
  chromatic: ['#FFF5FA', '#C05088'],
  organ: ['#EEF0FA', '#3E4A8C'],
  guitar: ['#F5EBE0', '#6B4423'],
  bass: ['#ECE6F4', '#4B3470'],
  strings: ['#F8F0E8', '#8B4513'],
  ensemble: ['#F4EEE4', '#7A5A2E'],
  brass: ['#FFF4DA', '#9A6A00'],
  reed: ['#EAF4EC', '#2F6E45'],
  pipe: ['#F0F4FA', '#4A5E8C'],
  lead: ['#0E1628', '#7FE0FF'],
  pad: ['#1A1433', '#C8B8FF'],
  fx: ['#10202A', '#8AF0C8'],
  ethnic: ['#FAF3E6', '#8A6A2F'],
  percussive: ['#F6F0E8', '#8B5A2B'],
  sfx: ['#EEF2F2', '#44585A']
}

function catalogToneThumbs() {
  const catalogPath = path.join(__dirname, '../src/shared/toneColorCatalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  const result = {}
  for (const item of catalog.items) {
    const [bg, color] = TONE_FAMILY_COLORS[item.family] ?? ['#F5F5F5', '#333']
    result[item.id] = toneColorLabel(item.name.zh, bg, color)
  }
  return result
}

function pianoSkinKeys(bg, gradId, theme) {
  const {
    gradStops,
    frameStroke,
    keys = ['#D0D8E0', '#E8EEF4', '#C8D0D8', '#E0E8F0', '#B8C0C8'],
    keyStrokes = ['#A0A8B0', '#B0B8C0', '#98A0A8', '#A8B0B8', '#8890A0'],
    blackKey = '#505860',
    highlight = true
  } = theme

  return card(bg, `
  <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
    ${gradStops}
  </linearGradient></defs>
  <rect x="10" y="24" width="44" height="20" rx="3" fill="url(#${gradId})" stroke="${frameStroke}"/>
  <rect x="12" y="26" width="6" height="16" rx="1" fill="${keys[0]}" stroke="${keyStrokes[0]}"/>
  <rect x="20" y="26" width="6" height="16" rx="1" fill="${keys[1]}" stroke="${keyStrokes[1]}"/>
  <rect x="28" y="26" width="6" height="16" rx="1" fill="${keys[2]}" stroke="${keyStrokes[2]}"/>
  <rect x="36" y="26" width="6" height="16" rx="1" fill="${keys[3]}" stroke="${keyStrokes[3]}"/>
  <rect x="44" y="26" width="6" height="16" rx="1" fill="${keys[4]}" stroke="${keyStrokes[4]}"/>
  <rect x="17" y="26" width="4" height="10" rx="0.5" fill="${blackKey}"/>
  <rect x="29" y="26" width="4" height="10" rx="0.5" fill="${blackKey}"/>
  <rect x="41" y="26" width="4" height="10" rx="0.5" fill="${blackKey}"/>
  ${highlight ? `<line x1="14" y1="27" x2="18" y2="29" stroke="#FFF" stroke-width="1" opacity="0.6"/>` : ''}`)
}

function monoChromeSplit() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" fill="#FFFFFF"/>
  <rect x="32" y="0" width="32" height="64" fill="#1A1A1A"/>
</svg>`
}

const thumbs = {
  // 名单内其它音色：按乐器族配色的文字卡（下方手写项覆盖同 id）
  ...catalogToneThumbs(),

  // 音色 1-6、22-26：居中文字
  1: toneColorLabel('三角钢琴', '#F3E8DC'),
  2: toneColorLabel('亮音钢琴', '#FFF9F0'),
  3: toneColorLabel('电钢琴', '#0E1628', '#E8F4FF'),
  4: toneColorLabel('尼龙弦吉他', '#F5EBE0', '#6B4423'),
  5: toneColorLabel('小提琴', '#F8F0E8', '#8B4513'),
  6: toneColorLabel('八音盒', '#FFF5FA', '#D06090'),
  22: toneColorLabel('口琴', '#EEF6FF', '#3A6EA5'),
  23: toneColorLabel('卡林巴', '#F2FAF4', '#2F8A5B'),
  24: toneColorLabel('短笛', '#F0F4FA', '#4A5E8C'),
  25: toneColorLabel('排箫', '#FAF3E6', '#8A6A2F'),
  26: toneColorLabel('打击乐', '#F6F0E8', '#8B5A2B'),

  // 7 默认曲谱皮肤
  7: card('#FAFAFA', `
  ${staffLines('#333', 20, 5)}
  <ellipse cx="38" cy="28" rx="4" ry="3" fill="#333"/>
  <line x1="42" y1="28" x2="42" y2="16" stroke="#333" stroke-width="1.5"/>
  <path d="M42 16 Q48 14 48 18 Q48 22 42 20" fill="#333"/>`),

  // 8 冰川
  8: card('#E8F8FF', `
  ${staffLines('#5AD4FF', 20, 5)}
  <path d="M8 50 L20 30 L32 50 Z" fill="#93E8FF" opacity="0.5" stroke="#5AD4FF" stroke-width="1"/>
  <path d="M36 50 L46 28 L56 50 Z" fill="#B8F0FF" opacity="0.6" stroke="#5AD4FF" stroke-width="1"/>
  <circle cx="48" cy="14" r="2" fill="#93E8FF" opacity="0.8"/>`),

  // 9 墨华
  9: card('#F0EEEC', `
  ${staffLines('rgba(38,38,46,0.45)', 22, 5)}
  <ellipse cx="22" cy="38" rx="12" ry="8" fill="rgba(16,16,20,0.25)"/>
  <ellipse cx="40" cy="42" rx="10" ry="6" fill="rgba(48,48,56,0.2)"/>
  <path d="M14 48 Q28 36 44 46 Q52 50 56 44" stroke="rgba(6,6,10,0.55)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="18" cy="30" r="1.5" fill="rgba(20,20,26,0.4)"/>`),

  // 10 默认演奏皮肤
  10: card('#FFFFFF', `
  <line x1="6" y1="48" x2="58" y2="48" stroke="#E84040" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="14" y="18" width="10" height="10" rx="2" fill="#FFD84D" stroke="#E8B820" stroke-width="1"/>
  <rect x="28" y="26" width="10" height="10" rx="2" fill="#4DA6FF" stroke="#2080E8" stroke-width="1"/>
  <rect x="42" y="14" width="10" height="10" rx="2" fill="#FFD84D" stroke="#E8B820" stroke-width="1"/>
  <rect x="20" y="34" width="10" height="10" rx="2" fill="#4DA6FF" stroke="#2080E8" stroke-width="1"/>`),

  // 11 彩虹演奏皮肤
  11: card('#FFF8FC', `
  <rect x="12" y="10" width="6" height="44" rx="2" fill="#FF6B8A"/>
  <rect x="20" y="14" width="6" height="40" rx="2" fill="#FFB84D"/>
  <rect x="28" y="12" width="6" height="42" rx="2" fill="#FFE84D"/>
  <rect x="36" y="16" width="6" height="38" rx="2" fill="#6BFF8A"/>
  <rect x="44" y="10" width="6" height="44" rx="2" fill="#6BB8FF"/>
  <rect x="52" y="14" width="4" height="40" rx="2" fill="#C98AFF" opacity="0.8"/>`),

  // 12 经典纯色钢琴皮肤
  12: pianoSkinKeys('#F5F5F5', 'classic', {
    gradStops: `<stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#F0F0F0"/><stop offset="100%" stop-color="#D8D8D8"/>`,
    frameStroke: '#BBBBBB',
    keys: ['#FFFFFF', '#FAFAFA', '#F5F5F5', '#FFFFFF', '#F0F0F0'],
    keyStrokes: ['#DDDDDD', '#D0D0D0', '#CCCCCC', '#DDDDDD', '#C8C8C8'],
    blackKey: '#222222',
    highlight: false
  }),

  // 13 重金属
  13: pianoSkinKeys('#2A2A32', 'metal', {
    gradStops: `<stop offset="0%" stop-color="#E8EEF4"/><stop offset="40%" stop-color="#A8B4C0"/><stop offset="100%" stop-color="#6A7680"/>`,
    frameStroke: '#8898A8'
  }),

  // 14 二进制演奏皮肤
  14: card('#0A1208', `
  <text x="10" y="20" fill="#3DFF6A" font-family="monospace" font-size="7" opacity="0.9">10110</text>
  <text x="10" y="30" fill="#2AE85A" font-family="monospace" font-size="7" opacity="0.7">01001</text>
  <text x="10" y="40" fill="#5AFF8A" font-family="monospace" font-size="7" opacity="0.85">11010</text>
  <text x="10" y="50" fill="#1ACC4A" font-family="monospace" font-size="7" opacity="0.6">00111</text>
  <text x="36" y="24" fill="#7AFFAA" font-family="monospace" font-size="8" font-weight="bold">1</text>
  <text x="44" y="38" fill="#4DFF7A" font-family="monospace" font-size="8" font-weight="bold">0</text>
  <text x="38" y="52" fill="#9AFFBA" font-family="monospace" font-size="7">101</text>`),

  // 15 星河演奏皮肤
  15: card('#0C1028', `
  <ellipse cx="32" cy="32" rx="22" ry="16" fill="#281850" opacity="0.6"/>
  <ellipse cx="28" cy="28" rx="14" ry="10" fill="#402878" opacity="0.5"/>
  <circle cx="16" cy="16" r="1" fill="#FFF" opacity="0.9"/><circle cx="48" cy="14" r="0.8" fill="#FFE8A0"/>
  <circle cx="52" cy="36" r="1.2" fill="#FFF" opacity="0.7"/><circle cx="12" cy="40" r="0.7" fill="#C8D8FF"/>
  <circle cx="40" cy="44" r="0.9" fill="#FFE8C0"/><circle cx="24" cy="12" r="0.6" fill="#FFF"/>
  <circle cx="36" cy="30" r="3" fill="#FFE8A0" opacity="0.9"/>
  <circle cx="36" cy="30" r="5" fill="#FFD060" opacity="0.25"/>`),

  // 16 斑马线演奏皮肤
  16: card('#F8F8F8', `
  <path d="M0 0 L64 20 L64 36 L0 16 Z" fill="#222"/>
  <path d="M0 16 L64 36 L64 52 L0 32 Z" fill="#FAFAFA" stroke="#DDD" stroke-width="0.5"/>
  <path d="M0 32 L64 52 L64 64 L0 64 Z" fill="#222"/>
  <rect x="20" y="22" width="12" height="8" rx="2" fill="#FFD020" stroke="#E8A800" stroke-width="1.2"/>`),

  // 17 黑白钢琴皮肤：左右对半一黑一白
  17: monoChromeSplit(),

  // 18 木板钢琴皮肤
  18: pianoSkinKeys('#EDE4D8', 'wood', {
    gradStops: `<stop offset="0%" stop-color="#D4B088"/><stop offset="40%" stop-color="#A67C52"/><stop offset="100%" stop-color="#8B6340"/>`,
    frameStroke: '#8B6340',
    keys: ['#D4B088', '#C49A6C', '#E0C098', '#C49A6C', '#D4B088'],
    keyStrokes: ['#8B6340', '#7A5538', '#9A7048', '#7A5538', '#8B6340'],
    blackKey: '#4A3020'
  }),

  // 19 寰宇曲谱皮肤
  19: card('#12082A', `
  <ellipse cx="32" cy="34" rx="20" ry="14" fill="#4020A0" opacity="0.5"/>
  <ellipse cx="36" cy="30" rx="12" ry="8" fill="#E060A0" opacity="0.35"/>
  <circle cx="20" cy="18" r="1" fill="#FFF"/><circle cx="44" cy="16" r="0.8" fill="#FFE8A0"/>
  <circle cx="50" cy="40" r="1" fill="#C8B8FF"/><circle cx="14" cy="44" r="0.7" fill="#FFF"/>
  ${staffLines('rgba(150,120,255,0.4)', 42, 3)}
  <path d="M46 10 L48 14 L52 14 L49 17 L50 21 L46 18 L42 21 L43 17 L40 14 L44 14 Z" fill="#FFD060" opacity="0.8"/>`),

  // 20 晨曦曲谱皮肤
  20: card('#FFF0E0', `
  <defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#8B5394" stop-opacity="0.3"/>
    <stop offset="50%" stop-color="#DF7A64" stop-opacity="0.25"/>
    <stop offset="100%" stop-color="#FFBD76" stop-opacity="0.2"/></linearGradient></defs>
  <rect x="0" y="0" width="64" height="64" fill="url(#dawn)"/>
  <circle cx="32" cy="44" r="12" fill="#FFD98A" opacity="0.7"/>
  <circle cx="32" cy="44" r="8" fill="#FFF0C0"/>
  <path d="M32 20 L34 28 L42 28 L36 32 L38 40 L32 36 L26 40 L28 32 L22 28 L30 28 Z" fill="#FFCE7E" opacity="0.5"/>
  ${staffLines('rgba(206,116,58,0.7)', 48, 3)}`),

  // 21 竹林曲谱皮肤
  21: card('#E8F5E4', `
  ${staffLines('rgba(52,112,56,0.55)', 40, 4)}
  <path d="M14 54 Q14 40 14 28" stroke="#3A7840" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M14 38 Q18 36 20 38" stroke="#4A9850" stroke-width="1.5" fill="none"/>
  <path d="M14 46 Q10 44 8 46" stroke="#4A9850" stroke-width="1.5" fill="none"/>
  <path d="M28 54 Q28 36 28 18" stroke="#2E6834" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M28 30 Q32 28 34 30" stroke="#5AAA58" stroke-width="1.5" fill="none"/>
  <path d="M28 42 Q24 40 22 42" stroke="#5AAA58" stroke-width="1.5" fill="none"/>
  <ellipse cx="28" cy="16" rx="3" ry="5" fill="#6AB86A" opacity="0.7" transform="rotate(-15 28 16)"/>`),

  // 146 像素街机演奏皮肤
  146: card('#0D0B2E', `
  <rect x="8" y="8" width="2" height="2" fill="#FFF"/><rect x="50" y="12" width="2" height="2" fill="#9AE8FF"/>
  <rect x="30" y="6" width="2" height="2" fill="#FFF" opacity="0.7"/><rect x="56" y="30" width="2" height="2" fill="#FF9AD0"/>
  <rect x="11" y="14" width="7" height="30" fill="#35D46A"/><rect x="11" y="14" width="7" height="2" fill="#B6FFC8"/>
  <rect x="22" y="22" width="7" height="22" fill="#00C8E8"/><rect x="22" y="22" width="7" height="2" fill="#B0F4FF"/>
  <rect x="33" y="10" width="7" height="34" fill="#8F5BFF"/><rect x="33" y="10" width="7" height="2" fill="#D6C2FF"/>
  <rect x="44" y="26" width="7" height="18" fill="#FF3D9A"/><rect x="44" y="26" width="7" height="2" fill="#FFC2DE"/>
  <rect x="0" y="46" width="8" height="3" fill="#FF3D9A"/><rect x="8" y="46" width="8" height="3" fill="#00C8E8"/>
  <rect x="16" y="46" width="8" height="3" fill="#FF3D9A"/><rect x="24" y="46" width="8" height="3" fill="#00C8E8"/>
  <rect x="32" y="46" width="8" height="3" fill="#FF3D9A"/><rect x="40" y="46" width="8" height="3" fill="#00C8E8"/>
  <rect x="48" y="46" width="8" height="3" fill="#FF3D9A"/><rect x="56" y="46" width="8" height="3" fill="#00C8E8"/>
  <rect x="22" y="50" width="7" height="6" fill="#FFD400"/><rect x="18" y="40" width="3" height="3" fill="#FFD400"/>
  <rect x="30" y="38" width="2" height="2" fill="#FFF6A8"/><rect x="26" y="36" width="2" height="2" fill="#FF8A00"/>`),

  // 147 薄荷汽水演奏皮肤
  147: card('#BFF2E4', `
  <defs><linearGradient id="mint147" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#6FE0C8"/><stop offset="100%" stop-color="#1FAE9C"/></linearGradient></defs>
  <circle cx="48" cy="16" r="9" fill="#5CC94A" opacity="0.55"/><circle cx="48" cy="16" r="7.5" fill="#EAFFD8" opacity="0.7"/>
  <path d="M48 16 L48 9 M48 16 L54 13 M48 16 L54 20 M48 16 L48 23 M48 16 L42 20 M48 16 L42 13" stroke="#96E164" stroke-width="1.5"/>
  <rect x="12" y="10" width="8" height="34" rx="4" fill="url(#mint147)"/>
  <rect x="26" y="20" width="8" height="24" rx="4" fill="url(#mint147)"/>
  <rect x="40" y="30" width="8" height="14" rx="4" fill="#FFD84A"/>
  <line x1="4" y1="48" x2="60" y2="48" stroke="#1FAE9C" stroke-width="2" stroke-linecap="round"/>
  <circle cx="18" cy="54" r="3" fill="#FFF" fill-opacity="0.45" stroke="#148C80" stroke-opacity="0.5"/>
  <circle cx="44" cy="22" r="2.5" fill="#FFF" fill-opacity="0.5" stroke="#148C80" stroke-opacity="0.5"/>
  <circle cx="36" cy="54" r="2" fill="#FFF" fill-opacity="0.5" stroke="#148C80" stroke-opacity="0.5"/>
  <circle cx="8" cy="30" r="2" fill="#FFF" fill-opacity="0.5" stroke="#148C80" stroke-opacity="0.5"/>`),

  // 148 樱花演奏皮肤
  148: card('#FFE3EC', `
  <path d="M0 52 L22 30 L28 34 L36 26 L64 50 L64 64 L0 64 Z" fill="#D9B8D6"/>
  <path d="M30 30 L36 26 L40 30 L35 30 Z" fill="#FFF"/>
  <path d="M-2 10 Q16 12 26 20 Q34 26 40 36" stroke="#6E4639" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M16 13 Q20 6 26 4" stroke="#6E4639" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <g fill="#FF9CBF"><circle cx="26" cy="4" r="3"/><circle cx="24" cy="20" r="3.2"/><circle cx="40" cy="36" r="3"/><circle cx="12" cy="11" r="2.6"/></g>
  <g fill="#FFF3F7"><circle cx="26" cy="4" r="1"/><circle cx="24" cy="20" r="1.1"/><circle cx="40" cy="36" r="1"/><circle cx="12" cy="11" r="0.9"/></g>
  <rect x="44" y="12" width="7" height="28" rx="3.5" fill="#E0527F"/>
  <rect x="54" y="24" width="7" height="18" rx="3.5" fill="#C93A6D"/>
  <line x1="2" y1="48" x2="62" y2="48" stroke="#6E4639" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="18" cy="40" rx="2" ry="1.2" fill="#FFB6D0" transform="rotate(30 18 40)"/>
  <ellipse cx="30" cy="54" rx="2" ry="1.2" fill="#FF9CBF" transform="rotate(-20 30 54)"/>`),

  // 149 萤火演奏皮肤
  149: card('#0B2A20', `
  <defs><radialGradient id="fly149"><stop offset="0%" stop-color="#FFFFE6"/><stop offset="30%" stop-color="#ECFF8C"/><stop offset="100%" stop-color="#A0E63C" stop-opacity="0"/></radialGradient></defs>
  <rect width="64" height="30" fill="#0A1A2E"/>
  <circle cx="48" cy="12" r="6" fill="#F0F6D8"/>
  <path d="M0 40 L6 26 L12 40 L16 30 L22 40 L28 24 L34 40 L40 32 L46 40 L52 26 L58 40 L64 30 L64 64 L0 64 Z" fill="#06140F"/>
  <rect x="12" y="10" width="7" height="30" rx="3.5" fill="#6FB84A"/>
  <rect x="26" y="18" width="7" height="22" rx="3.5" fill="#8FCF52"/>
  <rect x="40" y="36" width="7" height="12" rx="3.5" fill="#E4F76A"/>
  <line x1="2" y1="48" x2="62" y2="48" stroke="#3F8A3A" stroke-width="2"/>
  <circle cx="22" cy="44" r="5" fill="url(#fly149)"/><circle cx="8" cy="22" r="4" fill="url(#fly149)"/>
  <circle cx="54" cy="36" r="4" fill="url(#fly149)"/><circle cx="36" cy="56" r="4.5" fill="url(#fly149)"/>
  <circle cx="43" cy="48" r="7" fill="url(#fly149)"/>`),

  // 150 霓虹落日演奏皮肤
  150: card('#0C0224', `
  <defs>
    <linearGradient id="sky150" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0C0224"/><stop offset="70%" stop-color="#5A1470"/><stop offset="100%" stop-color="#FF3D8B"/></linearGradient>
    <linearGradient id="sun150" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF176"/><stop offset="55%" stop-color="#FFAB40"/><stop offset="100%" stop-color="#FF4F8B"/></linearGradient>
  </defs>
  <rect width="64" height="36" fill="url(#sky150)"/>
  <circle cx="32" cy="30" r="14" fill="url(#sun150)"/>
  <rect x="16" y="25" width="32" height="1.4" fill="#5A1470"/><rect x="16" y="29" width="32" height="2" fill="#5A1470"/><rect x="16" y="33" width="32" height="3" fill="#5A1470"/>
  <path d="M0 36 L8 28 L14 33 L20 30 L24 36 Z M40 36 L46 29 L52 33 L58 27 L64 32 L64 36 Z" fill="#16052E" stroke="#FF5AE0" stroke-width="0.8"/>
  <rect y="36" width="64" height="28" fill="#1A0433"/>
  <g stroke="#FF3CD2" stroke-width="0.8" opacity="0.8">
    <line x1="0" y1="40" x2="64" y2="40"/><line x1="0" y1="46" x2="64" y2="46"/><line x1="0" y1="55" x2="64" y2="55"/>
    <line x1="32" y1="36" x2="32" y2="64"/><line x1="32" y1="36" x2="12" y2="64"/><line x1="32" y1="36" x2="52" y2="64"/>
    <line x1="32" y1="36" x2="-8" y2="64"/><line x1="32" y1="36" x2="72" y2="64"/>
  </g>
  <rect x="10" y="6" width="6" height="26" rx="3" fill="#FF5AE0"/>
  <rect x="48" y="10" width="6" height="20" rx="3" fill="#6F9DFF"/>
  <rect x="48" y="44" width="6" height="12" rx="3" fill="#6FF6FF"/>
  <line x1="0" y1="44" x2="64" y2="44" stroke="#FFD6F6" stroke-width="1.4"/>`),

  // 151 极光演奏皮肤
  151: card('#020617', `
  <defs><linearGradient id="aur151" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#78FFB4"/><stop offset="50%" stop-color="#3CE6AA" stop-opacity="0.5"/><stop offset="100%" stop-color="#AA5AFF" stop-opacity="0"/></linearGradient></defs>
  <path d="M0 26 Q16 16 32 24 T64 20 L64 4 Q48 0 32 8 T0 8 Z" fill="url(#aur151)" opacity="0.85"/>
  <circle cx="10" cy="34" r="0.8" fill="#FFF"/><circle cx="54" cy="30" r="0.8" fill="#FFF"/><circle cx="40" cy="6" r="0.6" fill="#FFF"/>
  <path d="M0 50 L14 34 L22 42 L34 28 L50 46 L58 38 L64 44 L64 64 L0 64 Z" fill="#2B4A6E"/>
  <path d="M34 28 L38 33 L35 32 L32 34 L30 32 Z M14 34 L17 38 L14 37 L11 38 Z" fill="#F0FAFF"/>
  <rect y="54" width="64" height="10" fill="#CFE3F5"/>
  <rect x="12" y="10" width="7" height="32" rx="3.5" fill="#4FD8D0"/>
  <rect x="26" y="20" width="7" height="22" rx="3.5" fill="#9FF7E8"/>
  <rect x="42" y="36" width="7" height="12" rx="3.5" fill="#D2B8FF"/>
  <line x1="2" y1="48" x2="62" y2="48" stroke="#E8FBFF" stroke-width="1.6"/>
  <path d="M45.5 26 V32 M42.9 27.5 L48.1 30.5 M42.9 30.5 L48.1 27.5" stroke="#FFF" stroke-width="0.9"/>`),

  // 152 金龙演奏皮肤
  152: card('#5A0C12', `
  <defs>
    <linearGradient id="gold152" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF2B0"/><stop offset="50%" stop-color="#F5C542"/><stop offset="100%" stop-color="#B8860B"/></linearGradient>
    <radialGradient id="pearl152"><stop offset="0%" stop-color="#FFFAE0"/><stop offset="40%" stop-color="#FFD25A"/><stop offset="100%" stop-color="#FF8C1E" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="64" height="7" fill="#28040A"/>
  <path d="M1 6 H7 M2 6 V2 H6 V5 H4 V3.5 M9 6 H15 M10 6 V2 H14 V5 H12 V3.5 M17 6 H23 M18 6 V2 H22 V5 H20 V3.5 M25 6 H31 M26 6 V2 H30 V5 H28 V3.5 M33 6 H39 M34 6 V2 H38 V5 H36 V3.5 M41 6 H47 M42 6 V2 H46 V5 H44 V3.5 M49 6 H55 M50 6 V2 H54 V5 H52 V3.5 M57 6 H63 M58 6 V2 H62 V5 H60 V3.5" stroke="#F5C542" stroke-width="0.8" fill="none"/>
  <path d="M4 34 Q14 22 24 30 T44 26" stroke="url(#gold152)" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M8 29 L9 26 L11 29 M18 25 L19 22 L21 25 M30 30 L31 27 L33 30" fill="#C8102E"/>
  <path d="M42 22 Q48 20 52 24 L48 27 Q44 28 42 26 Z" fill="url(#gold152)"/>
  <circle cx="47" cy="23.5" r="0.9" fill="#8A0A12"/>
  <path d="M43 22 Q40 17 36 17" stroke="#B8860B" stroke-width="1.2" fill="none"/>
  <circle cx="58" cy="22" r="5" fill="url(#pearl152)"/>
  <rect x="12" y="38" width="7" height="12" rx="2" fill="#C8102E" stroke="#F5C542" stroke-width="1"/>
  <rect x="26" y="42" width="7" height="8" rx="2" fill="#FFD24A" stroke="#C78A0C" stroke-width="1"/>
  <rect x="40" y="36" width="7" height="14" rx="2" fill="#C8102E" stroke="#F5C542" stroke-width="1"/>
  <rect y="51" width="64" height="4" fill="url(#gold152)"/>
  <ellipse cx="8" cy="15" rx="4" ry="4.5" fill="#D7141E"/><rect x="5.5" y="10" width="5" height="1.4" fill="#F5C542"/><rect x="5.5" y="19" width="5" height="1.4" fill="#F5C542"/>`),

  // 153 雷霆演奏皮肤
  153: card('#07081A', `
  <defs><linearGradient id="storm153" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#07081A"/><stop offset="100%" stop-color="#232A52"/></linearGradient></defs>
  <rect width="64" height="64" fill="url(#storm153)"/>
  <ellipse cx="14" cy="10" rx="18" ry="8" fill="#2A2F58"/><ellipse cx="40" cy="8" rx="20" ry="9" fill="#1E2244"/>
  <ellipse cx="58" cy="14" rx="12" ry="6" fill="#2A2F58"/>
  <path d="M34 12 L28 28 L34 28 L26 46 L42 24 L35 24 L40 12 Z" fill="#E8F6FF" stroke="#8C6EFF" stroke-width="1.2" stroke-linejoin="round"/>
  <g stroke="#AAB8FF" stroke-width="0.7" opacity="0.5"><line x1="8" y1="24" x2="6" y2="30"/><line x1="18" y1="34" x2="16" y2="40"/><line x1="52" y1="28" x2="50" y2="34"/><line x1="58" y1="40" x2="56" y2="46"/></g>
  <rect x="10" y="18" width="7" height="30" rx="3.5" fill="#7446F0"/>
  <path d="M13.5 20 L12.5 26 L14.5 32 L12.5 38 L14 44" stroke="#BEF0FF" stroke-width="0.8" fill="none"/>
  <rect x="48" y="36" width="7" height="12" rx="3.5" fill="#AEF0FF"/>
  <path d="M51.5 36 L49 30 L53 27 L50 22" stroke="#FFF" stroke-width="1" fill="none"/>
  <path d="M0 49 L8 48.2 L16 49.6 L24 48.4 L32 49.5 L40 48.3 L48 49.4 L56 48.5 L64 49" stroke="#D2F5FF" stroke-width="1.2" fill="none"/>
  <path d="M0 56 Q16 52 32 55 T64 54 L64 64 L0 64 Z" fill="#04050B"/>`),
  // 154 空洞演奏皮肤
  154: card('#000000', `
  <defs>
    <filter id="glow154" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="flow154" x1="0" y1="0" x2="0.45" y2="1"><stop offset="0%" stop-color="#FF8A00"/><stop offset="40%" stop-color="#FFD45C"/><stop offset="55%" stop-color="#FFF6D6"/><stop offset="100%" stop-color="#C86A00"/></linearGradient>
    <linearGradient id="halo154" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFB31C" stop-opacity="0"/><stop offset="50%" stop-color="#FFB31C" stop-opacity="0.35"/><stop offset="100%" stop-color="#FFB31C" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="0" y="40" width="64" height="16" fill="url(#halo154)"/>
  <g filter="url(#glow154)" stroke-linejoin="round" stroke="url(#flow154)">
    <rect x="10" y="10" width="8" height="22" rx="1.5" stroke-width="1.2"/>
    <rect x="22" y="4" width="8" height="16" rx="1.5" stroke-width="1.2" opacity="0.8"/>
    <rect x="44" y="14" width="8" height="26" rx="1.5" stroke-width="1.2"/>
    <rect x="30" y="34" width="8" height="20" rx="1.5" stroke-width="1.5" fill="#FFC040" fill-opacity="0.15"/>
    <line x1="0" y1="48" x2="64" y2="48" stroke="#FFD45C" stroke-width="1.2"/>
  </g>
  <g stroke="#FFF2C8" stroke-width="0.5" stroke-linecap="round" fill="none" filter="url(#glow154)">
    <path d="M34 47 Q33.5 38 33 26"/><path d="M34 47 Q35 36 36.5 29" opacity="0.8"/><path d="M34 47 Q32.5 40 31 32" opacity="0.7"/>
    <path d="M35 44 Q36.5 34 38 24" opacity="0.5"/><path d="M33 44 Q31.5 35 29.5 27" opacity="0.5"/>
  </g>
  <circle cx="34" cy="48" r="1.6" fill="#FFF6D8" filter="url(#glow154)"/>`)
}

fs.mkdirSync(outDir, { recursive: true })
for (const [id, svg] of Object.entries(thumbs)) {
  const content = typeof svg === 'string' && svg.startsWith('<svg') ? svg : svg.trim() + '\n'
  fs.writeFileSync(path.join(outDir, `${id}.svg`), content)
}
console.log(`Wrote ${Object.keys(thumbs).length} thumbnails to ${outDir}`)
