/**
 * 歌词智能匹配：一个复谱表一段文本，每行对应其中一个单谱表，拆字后按顺序填进该单谱表音符的第一行歌词。
 * 跳过休止符，以及连音线起点之后到终点为止的音（起点那个音唱这个字，从上一个复谱表连过来的也算）；
 * `_` 空过一个音。
 */
import {
  DoubleNoteAffiliatedSymbolNameEnum,
  isMeasureNoteVoices,
  slotSymbol,
  type Lyrics,
  type MeasureNoteSlot,
  type MeasureNoteSymbol,
  type MusicScore
} from '@deciphony/renderer'
import { isDrumRestBody, isSlotRestLike } from '@deciphony/extensions/dr-edit/score-builder'

export const LYRICS_SKIP_MARK = '_'

/** 中日韩文字：一字一音 */
const CJK_LETTER_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u
/** 中日韩文字、全角标点：拼回文本时与相邻同类字之间不加空格 */
const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u2018-\u201f\u3000-\u303f\uff00-\uffef]/u
const WORD_CHAR_RE = /[\p{L}\p{N}]/u
const OPEN_PUNCT_RE = /[\p{Ps}\p{Pi}]/u
const APOSTROPHE_RE = /['’]/

/**
 * 拆成按音分配的字：中日韩一字一音；其它文字按空格分词，`-` 拆音节（留在前一音节末尾）；
 * 标点跟前一个字，开括号 / 开引号跟后一个字；`_` 空过一个音（结果里是 ''）。
 */
export function splitLyricSyllables(text: string): string[] {
  const out: string[] = []
  let word: string | null = null
  let prefix = ''
  const flush = () => {
    if (word != null) out.push(word)
    word = null
  }
  const attachToLast = (ch: string) => {
    if (out.length) out[out.length - 1] += ch
    else prefix += ch
  }
  for (const ch of text) {
    if (/\s/.test(ch)) {
      flush()
    } else if (ch === LYRICS_SKIP_MARK) {
      flush()
      out.push('')
    } else if (CJK_LETTER_RE.test(ch)) {
      flush()
      out.push(prefix + ch)
      prefix = ''
    } else if (WORD_CHAR_RE.test(ch)) {
      word = (word ?? prefix) + ch
      prefix = ''
    } else if (ch === '-') {
      if (word != null) {
        word += ch
        flush()
      } else {
        attachToLast(ch)
      }
    } else if (word != null && APOSTROPHE_RE.test(ch)) {
      word += ch
    } else if (OPEN_PUNCT_RE.test(ch)) {
      flush()
      prefix += ch
    } else if (word != null) {
      word += ch
      flush()
    } else {
      attachToLast(ch)
    }
  }
  flush()
  if (prefix) attachToLast(prefix)
  return out
}

function isTightChar(ch: string): boolean {
  return ch === LYRICS_SKIP_MARK || CJK_RE.test(ch)
}

/** splitLyricSyllables 的逆：中日韩与 `_` 之间、`-` 结尾的音节后不加空格；'' 写成 `_`，末尾空字去掉 */
export function joinLyricSyllables(syllables: readonly string[]): string {
  let end = syllables.length
  while (end > 0 && syllables[end - 1] === '') end--
  let out = ''
  for (let i = 0; i < end; i++) {
    const cur = syllables[i] || LYRICS_SKIP_MARK
    if (i > 0) {
      const prev = syllables[i - 1] || LYRICS_SKIP_MARK
      const tight = prev.endsWith('-') || (isTightChar(prev.slice(-1)) && isTightChar(cur[0] ?? ''))
      if (!tight) out += ' '
    }
    out += cur
  }
  return out
}

/** 上下声部的小节只取上声部，与按时间顺序填词一致 */
function measureTrackSlots(notes: Parameters<typeof isMeasureNoteVoices>[0]): MeasureNoteSlot[] {
  return isMeasureNoteVoices(notes) ? notes.up ?? [] : notes
}

function slotNoteIds(slot: MeasureNoteSlot): string[] {
  const body = slotSymbol(slot) as {
    notesInfo?: { id: string }[]
    graceNotes?: { id: string }[]
    graceNotesAfter?: { id: string }[]
  }
  return [
    ...(body.notesInfo ?? []).map((info) => info.id),
    ...(body.graceNotes ?? []).map((info) => info.id),
    ...(body.graceNotesAfter ?? []).map((info) => info.id)
  ]
}

function isRestSlot(slot: MeasureNoteSlot): boolean {
  return isSlotRestLike(slot) || isDrumRestBody(slotSymbol(slot) as MeasureNoteSymbol)
}

/**
 * 第 grandStaffIndex 个复谱表里第 staffIndex 个单谱表可以按顺序填字的槽位。
 * 连音线按整首歌同一下标的单谱表判断，从上一个复谱表连过来的也会跳过。
 */
export function collectLyricTargetSlots(
  musicScore: MusicScore,
  grandStaffIndex: number,
  staffIndex: number
): MeasureNoteSlot[] {
  const track: { slot: MeasureNoteSlot; grandStaffIndex: number }[] = []
  const noteSlotIndex = new Map<string, number>()
  musicScore.grandStaffs.forEach((gs, gsIndex) => {
    const staff = gs.staves[staffIndex]
    if (!staff) return
    for (const measure of staff.measures) {
      for (const slot of measureTrackSlots(measure.notes)) {
        for (const id of slotNoteIds(slot)) noteSlotIndex.set(id, track.length)
        track.push({ slot, grandStaffIndex: gsIndex })
      }
    }
  })
  const covered = new Set<number>()
  for (const sym of musicScore.affiliatedSymbols ?? []) {
    if (sym.name !== DoubleNoteAffiliatedSymbolNameEnum.Slur) continue
    if (!('startId' in sym) || !('endId' in sym)) continue
    const a = noteSlotIndex.get(sym.startId)
    const b = noteSlotIndex.get(sym.endId)
    if (a == null || b == null) continue
    for (let i = Math.min(a, b) + 1; i <= Math.max(a, b); i++) covered.add(i)
  }
  return track
    .filter((e, i) => e.grandStaffIndex === grandStaffIndex && !covered.has(i) && !isRestSlot(e.slot))
    .map((e) => e.slot)
}

function emptyLyrics(): Lyrics {
  return { text: '', relativeX: 0, relativeY: 0, relativeW: 0, relativeH: 0 }
}

function readFirstLine(slot: MeasureNoteSlot): string {
  return Array.isArray(slot.lyrics) ? slot.lyrics[0]?.text ?? '' : ''
}

function writeFirstLine(slot: MeasureNoteSlot, text: string): void {
  const next = (Array.isArray(slot.lyrics) ? slot.lyrics : []).map((item) => ({ ...item }))
  if (!next.length) next.push(emptyLyrics())
  next[0] = { ...next[0]!, text }
  slot.lyrics = next
}

/** 复谱表已有歌词拼回的文本：每个单谱表一行，末尾空行去掉 */
export function readGrandStaffLyricsText(musicScore: MusicScore, grandStaffIndex: number): string {
  const staves = musicScore.grandStaffs[grandStaffIndex]?.staves ?? []
  const lines = staves.map((_, staffIndex) =>
    joinLyricSyllables(collectLyricTargetSlots(musicScore, grandStaffIndex, staffIndex).map(readFirstLine))
  )
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  return lines.join('\n')
}

export type LyricsMatchOverflow = {
  /** 每个单谱表多出、没有填入的字数 */
  syllables: number[]
  /** 超出单谱表个数、有内容的行数 */
  lines: number
}

/**
 * 文本第 n 行拆字后依次写进复谱表第 n 个单谱表音符的第一行歌词；
 * 字少时后面的音清空，字多的丢掉，缺的行视为空行。
 */
export function applyGrandStaffLyricsText(
  musicScore: MusicScore,
  grandStaffIndex: number,
  text: string
): LyricsMatchOverflow {
  const staves = musicScore.grandStaffs[grandStaffIndex]?.staves ?? []
  const lines = text.split(/\r?\n/)
  const syllables = staves.map((_, staffIndex) => {
    const slots = collectLyricTargetSlots(musicScore, grandStaffIndex, staffIndex)
    const parts = splitLyricSyllables(lines[staffIndex] ?? '')
    slots.forEach((slot, i) => {
      const next = parts[i] ?? ''
      if (readFirstLine(slot) === next) return
      if (next === '' && !(Array.isArray(slot.lyrics) && slot.lyrics.length)) return
      writeFirstLine(slot, next)
    })
    return Math.max(0, parts.length - slots.length)
  })
  return { syllables, lines: lines.slice(staves.length).filter((line) => line.trim()).length }
}

