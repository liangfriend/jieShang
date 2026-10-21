import { KeyCodeEnum } from '@renderer/types/enum'

/** letter：主键盘字母/数字区；numpad：小键盘区。两侧八度各自调整 */
export type PcKeyboardSide = 'letter' | 'numpad'

export type PcKeyNote = {
  side: PcKeyboardSide
  /** 简谱级数 1~7，1 = C */
  degree: number
  /** 相对本侧基准（C4 + 本侧八度）的八度偏移 */
  octave: number
}

export const PC_KEYBOARD_OCTAVE_MIN = -3
export const PC_KEYBOARD_OCTAVE_MAX = 3

const C4 = 60
const PIANO_MIDI_MIN = 21
const PIANO_MIDI_MAX = 108
const DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11]

/** 一排按键从 1 开始依次排列，超过 7 进入上一个八度 */
function letterRow(codes: KeyCodeEnum[], octave: number): [string, PcKeyNote][] {
  return codes.map((code, i) => [
    code,
    { side: 'letter', degree: (i % 7) + 1, octave: octave + Math.floor(i / 7) }
  ])
}

function numpadKey(code: KeyCodeEnum, degree: number, octave: number): [string, PcKeyNote] {
  return [code, { side: 'numpad', degree, octave }]
}

const K = KeyCodeEnum

/** 按键（KeyboardEvent.code）→ 音高；Q 行 1 为字母侧基准，小键盘 1 为小键盘侧基准 */
export const PC_KEY_NOTES: ReadonlyMap<string, PcKeyNote> = new Map([
  ...letterRow(
    [K.Digit1, K.Digit2, K.Digit3, K.Digit4, K.Digit5, K.Digit6, K.Digit7, K.Digit8, K.Digit9, K.Digit0, K.Minus, K.Equal],
    1
  ),
  ...letterRow(
    [K.KeyQ, K.KeyW, K.KeyE, K.KeyR, K.KeyT, K.KeyY, K.KeyU, K.KeyI, K.KeyO, K.KeyP, K.BracketLeft, K.BracketRight, K.Backslash],
    0
  ),
  ...letterRow(
    [K.KeyA, K.KeyS, K.KeyD, K.KeyF, K.KeyG, K.KeyH, K.KeyJ, K.KeyK, K.KeyL, K.Semicolon, K.Quote],
    -1
  ),
  ...letterRow([K.KeyZ, K.KeyX, K.KeyC, K.KeyV, K.KeyB, K.KeyN, K.KeyM, K.Comma, K.Period, K.Slash], -2),
  numpadKey(K.Numpad0, 6, -1),
  numpadKey(K.NumpadDecimal, 7, -1),
  numpadKey(K.Numpad1, 1, 0),
  numpadKey(K.Numpad2, 2, 0),
  numpadKey(K.Numpad3, 3, 0),
  numpadKey(K.Numpad4, 4, 0),
  numpadKey(K.Numpad5, 5, 0),
  numpadKey(K.Numpad6, 6, 0),
  numpadKey(K.Numpad7, 7, 0),
  numpadKey(K.Numpad8, 1, 1),
  numpadKey(K.Numpad9, 2, 1),
  numpadKey(K.NumpadDivide, 3, 1),
  numpadKey(K.NumpadMultiply, 4, 1),
  numpadKey(K.NumpadSubtract, 5, 1),
  numpadKey(K.NumpadAdd, 6, 1),
  numpadKey(K.NumpadEnter, 7, 1)
])

/** 超出 88 键钢琴范围时返回 null */
export function pcKeyMidi(note: PcKeyNote, sideOctave: number, sharp: boolean): number | null {
  const midi =
    C4 + 12 * (sideOctave + note.octave) + DEGREE_SEMITONES[note.degree - 1]! + (sharp ? 1 : 0)
  return midi >= PIANO_MIDI_MIN && midi <= PIANO_MIDI_MAX ? midi : null
}

function dotsHtml(count: number): string {
  return '<i></i>'.repeat(count)
}

/** 键帽上的简谱：数字 + 高低八度点（相对 C4），按 Shift 时带 ♯ */
export function pcKeyLabelHtml(note: PcKeyNote, sideOctave: number, sharp: boolean): string {
  const octave = sideOctave + note.octave
  const outOfRange = pcKeyMidi(note, sideOctave, sharp) == null
  return (
    `<span class="pc-key${outOfRange ? ' pc-key--out' : ''}">` +
    `<span class="pc-key__dots">${dotsHtml(Math.max(0, octave))}</span>` +
    `<span class="pc-key__num">${sharp ? '<span class="pc-key__sharp">♯</span>' : ''}${note.degree}</span>` +
    `<span class="pc-key__dots">${dotsHtml(Math.max(0, -octave))}</span>` +
    `</span>`
  )
}
