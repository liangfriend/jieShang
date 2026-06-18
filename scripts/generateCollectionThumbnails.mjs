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

function toneColorLabel(text, bg, color = '#333') {
  return card(bg, `
  <text x="32" y="34" text-anchor="middle" fill="${color}" font-family="system-ui, 'Microsoft YaHei', sans-serif" font-size="10" font-weight="600">${text}</text>`)
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
  // 音色 1-6：居中文字
  1: toneColorLabel('三角钢琴', '#F3E8DC'),
  2: toneColorLabel('亮音钢琴', '#FFF9F0'),
  3: toneColorLabel('电钢琴', '#0E1628', '#E8F4FF'),
  4: toneColorLabel('尼龙弦吉他', '#F5EBE0', '#6B4423'),
  5: toneColorLabel('小提琴', '#F8F0E8', '#8B4513'),
  6: toneColorLabel('八音盒', '#FFF5FA', '#D06090'),

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
  <ellipse cx="28" cy="16" rx="3" ry="5" fill="#6AB86A" opacity="0.7" transform="rotate(-15 28 16)"/>`)
}

fs.mkdirSync(outDir, { recursive: true })
for (const [id, svg] of Object.entries(thumbs)) {
  const content = typeof svg === 'string' && svg.startsWith('<svg') ? svg : svg.trim() + '\n'
  fs.writeFileSync(path.join(outDir, `${id}.svg`), content)
}
console.log(`Wrote ${Object.keys(thumbs).length} thumbnails to ${outDir}`)
