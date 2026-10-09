/**
 * 管乐指法表（通用）。每种指法表按「首调唱名 + 八度 + 升号」列出孔位组合，
 * 与具体调门无关；调门由 tonicMidi（中音区 do 的 midi）决定实际音高。
 *
 * fingers 字符串：c = 按住，h = 半按，o = 开孔；下标 0 为最靠近吹孔的指孔。
 */

export type FingerHoleState = 'c' | 'h' | 'o'

export type Solfege = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type FingeringNote = {
  solfege: Solfege
  /** -1 低音区，0 中音区，1 高音区，2 倍高音区 */
  octave: number
  sharp: boolean
  /** 可选指法（第一个为常用指法） */
  fingers: string[]
}

export type FingeringChart = {
  id: string
  holeCount: number
  /** 中音区 do 的 midi */
  tonicMidi: number
  notes: FingeringNote[]
}

const SOLFEGE_SEMITONE: Record<Solfege, number> = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 }

type RawNote = [solfege: Solfege, octave: number, sharp: boolean, fingers: string | string[]]

/**
 * 六孔笛（筒音作 5），整理自 kbasm「中国竹笛指法表」。
 * https://www.kbasm.com/apps/cn/music-flute-fingering-chart
 */
const DIZI6_TONG5_RAW: RawNote[] = [
  [5, -1, false, 'cccccc'],
  [5, -1, true, 'ccccch'],
  [6, -1, false, 'ccccco'],
  [6, -1, true, ['ccccoc', 'ccccho']],
  [7, -1, false, 'ccccoo'],
  [1, 0, false, 'cccooo'],
  [1, 0, true, ['ccocoo', 'cchooo']],
  [2, 0, false, 'ccoooo'],
  [2, 0, true, ['coccoo', 'choooo']],
  [3, 0, false, 'cooooo'],
  [4, 0, false, ['occooo', 'hooooo', 'occcoo']],
  [4, 0, true, ['oococo', 'oooooo']],
  [5, 0, false, ['occccc', 'cccccc']],
  [5, 0, true, 'ccccch'],
  [6, 0, false, 'ccccco'],
  [6, 0, true, ['ccccoc', 'ccccho']],
  [7, 0, false, 'ccccoo'],
  [1, 1, false, 'cccooo'],
  [1, 1, true, ['ccocoo', 'cchooo']],
  [2, 1, false, 'ccoooo'],
  [2, 1, true, ['cocooo', 'choooo']],
  [3, 1, false, 'cooooo'],
  [4, 1, false, ['occcco', 'hooooo', 'ocoooo', 'coccoo']],
  [4, 1, true, ['oooooo', 'oococo', 'occcoo']],
  [5, 1, false, ['occccc', 'cccccc', 'occooo']],
  [5, 1, true, ['cchcch', 'cchccc', 'ccococ']],
  [6, 1, false, ['ccocco', 'ccoooc']],
  [6, 1, true, 'chooco'],
  [7, 1, false, ['coccoc', 'cocccc']],
  [1, 2, false, ['cocooc', 'cocooo']],
  [1, 2, true, 'oocooo'],
  [2, 2, false, ['occcco']]
]

function toNotes(raw: RawNote[]): FingeringNote[] {
  return raw.map(([solfege, octave, sharp, fingers]) => ({
    solfege,
    octave,
    sharp,
    fingers: Array.isArray(fingers) ? fingers : [fingers]
  }))
}

/** 六孔 G 调笛（梆笛 / 短笛）：筒音 D5 作 5，中音 do = G5 */
export const DIZI6_G_CHART: FingeringChart = {
  id: 'dizi6-g',
  holeCount: 6,
  tonicMidi: 79,
  notes: toNotes(DIZI6_TONG5_RAW)
}

export function fingeringNoteMidi(chart: FingeringChart, note: FingeringNote): number {
  return (
    chart.tonicMidi + note.octave * 12 + SOLFEGE_SEMITONE[note.solfege] + (note.sharp ? 1 : 0)
  )
}

/** 当前孔位组合可吹出的音（同一指法不同气息可能对应多个八度），按音高升序 */
export function matchFingering(chart: FingeringChart, fingers: string): FingeringNote[] {
  return chart.notes
    .filter((n) => n.fingers.includes(fingers))
    .sort((a, b) => fingeringNoteMidi(chart, a) - fingeringNoteMidi(chart, b))
}

/** 简谱文本：升号前置，低音点 / 高音点用组合字符 */
export function fingeringNoteJianpu(note: FingeringNote): string {
  const base = `${note.sharp ? '#' : ''}${note.solfege}`
  if (note.octave < 0) return base + '\u0323'.repeat(-note.octave)
  if (note.octave > 0) return base + '\u0307'.repeat(note.octave)
  return base
}
