/** 美式键位：物理键 → [不按 Shift, 按 Shift] */
const US_KEY_BY_CODE: Record<string, readonly [string, string]> = {
  Backquote: ['`', '~'],
  Minus: ['-', '_'],
  Equal: ['=', '+'],
  BracketLeft: ['[', '{'],
  BracketRight: [']', '}'],
  Backslash: ['\\', '|'],
  Semicolon: [';', ':'],
  Quote: ["'", '"'],
  Comma: [',', '<'],
  Period: ['.', '>'],
  Slash: ['/', '?'],
  Space: [' ', ' '],
  NumpadDivide: ['/', '/'],
  NumpadMultiply: ['*', '*'],
  NumpadSubtract: ['-', '-'],
  NumpadAdd: ['+', '+'],
  NumpadDecimal: ['.', '.']
}

const DIGIT_SHIFTED = [')', '!', '@', '#', '$', '%', '^', '&', '*', '(']

for (let d = 0; d <= 9; d++) {
  US_KEY_BY_CODE[`Digit${d}`] = [String(d), DIGIT_SHIFTED[d]!]
  US_KEY_BY_CODE[`Numpad${d}`] = [String(d), String(d)]
}
for (let i = 0; i < 26; i++) {
  const upper = String.fromCharCode(65 + i)
  US_KEY_BY_CODE[`Key${upper}`] = [upper.toLowerCase(), upper]
}

/** 中文输入法下 Shift 组合产生的非全角区符号；全角区 U+FF01–FF5E 统一按偏移换算 */
const FULLWIDTH_TO_ASCII: Record<string, string> = {
  '《': '<',
  '》': '>',
  '×': '*',
  '…': '^',
  '￥': '$',
  '“': '"',
  '”': '"'
}

const IME_PLACEHOLDER_KEYS = new Set(['Process', 'Unidentified', 'Dead'])

/** 输入法处理中的按键（key 为 Process）按物理键还原的功能键 */
const NAMED_KEY_BY_CODE: Record<string, string> = {
  Backspace: 'Backspace',
  Delete: 'Delete',
  Enter: 'Enter',
  NumpadEnter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight'
}

/**
 * 快捷键用的按键值，不受中英文输入法影响：
 * 输入法开启时 key 会变成 Process / 全角符号（《 》，。等），此时按物理键位还原成英文键值。
 */
export function shortcutKey(event: KeyboardEvent): string {
  const { key } = event
  if (key.length === 1) {
    const code = key.charCodeAt(0)
    if (code < 0x80) return key
    const halfWidth =
      FULLWIDTH_TO_ASCII[key] ?? (code >= 0xff01 && code <= 0xff5e ? String.fromCharCode(code - 0xfee0) : null)
    if (halfWidth) return halfWidth
  } else if (/^[A-Za-z][A-Za-z0-9]+$/.test(key) && !IME_PLACEHOLDER_KEYS.has(key)) {
    return key
  }
  const named = NAMED_KEY_BY_CODE[event.code]
  if (named) return named
  const shift = event.shiftKey || event.getModifierState?.('Shift')
  return US_KEY_BY_CODE[event.code]?.[shift ? 1 : 0] ?? key
}

/**
 * 焦点是否在真正的文本输入上（此时快捷键让给输入框）。
 * radio / checkbox / button 等控件不算；el-select 这类只读输入框不算，但下拉展开时算（方向键 / Enter 交给它）。
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) {
    if (target.readOnly || target.disabled) return target.getAttribute('aria-expanded') === 'true'
    const type = (target.type || 'text').toLowerCase()
    return ![
      'radio',
      'checkbox',
      'button',
      'submit',
      'reset',
      'file',
      'image',
      'hidden',
      'range',
      'color'
    ].includes(type)
  }
  return false
}
