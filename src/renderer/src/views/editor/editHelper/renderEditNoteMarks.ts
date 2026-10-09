import {
  SingleNoteAffiliatedSymbolNameEnum as N,
  type SingleNoteAffiliatedSymbol,
} from '@deciphony/renderer'
import {newId, ZERO_FRAME} from '@deciphony/extensions/dr-edit/score-builder'

/** 单音符附属（奏法 / 技巧 / 装饰音 / 力度）分组；SFF 无字形不列出 */
export type NoteMarkCategory = 'articulation' | 'technique' | 'ornament' | 'dynamic'

export type NoteMarkGroup = {
  category: NoteMarkCategory
  /** 同组互斥：添加时替换组内已有符号 */
  exclusive: boolean
  names: N[]
}

export const NOTE_MARK_GROUPS: NoteMarkGroup[] = [
  {
    category: 'articulation',
    exclusive: false,
    names: [
      N.Accent_above, N.Staccato_above, N.Staccatissimo_above, N.Tenuto_above, N.Loure_above,
      N.Marcato_above, N.Accent_staccato_above, N.Marcato_staccato_above, N.Marcato_tenuto_above,
      N.Staccatissimo_stroke_above, N.Staccatissimo_wedge_above, N.Stress_above,
      N.Tenuto_accent_above, N.Unstress_above,
    ],
  },
  {
    category: 'technique',
    exclusive: false,
    names: [N.Open, N.Muted, N.Harmonic, N.Up_bow, N.Down_bow, N.Breath],
  },
  {
    category: 'ornament',
    exclusive: true,
    names: [N.Turn, N.InvertedTurn, N.Trill, N.ShortTrill, N.Mordent],
  },
  {
    category: 'dynamic',
    exclusive: true,
    names: [
      N.PPP, N.PP, N.P, N.MP, N.MF, N.F, N.FF, N.FFF,
      N.FP, N.PF, N.SF, N.SFZ, N.SFFZ, N.SFP, N.RFZ, N.RF, N.FZ,
    ],
  },
]

const GROUP_BY_NAME = new Map<string, NoteMarkGroup>(
  NOTE_MARK_GROUPS.flatMap((group) => group.names.map((name) => [name, group] as const)),
)

export type NoteMarkHost = { affiliatedSymbols?: SingleNoteAffiliatedSymbol[] }

export function noteMarkGroup(name: string): NoteMarkGroup | null {
  return GROUP_BY_NAME.get(name) ?? null
}

/** 与 renderer renderRules 保持一致：力度为 dyn_*，其余与枚举值同名 */
export function noteMarkSkinKey(name: string): string {
  return noteMarkGroup(name)?.category === 'dynamic' ? `dyn_${name}` : name
}

export function listNoteMarks(host: NoteMarkHost | null | undefined): SingleNoteAffiliatedSymbol[] {
  return host?.affiliatedSymbols ?? []
}

export function hasNoteMark(host: NoteMarkHost | null | undefined, name: N): boolean {
  return listNoteMarks(host).some((sym) => sym.name === name)
}

function ensureMarks(host: NoteMarkHost): SingleNoteAffiliatedSymbol[] {
  if (!Array.isArray(host.affiliatedSymbols)) host.affiliatedSymbols = []
  return host.affiliatedSymbols
}

export function createNoteMark(name: N): SingleNoteAffiliatedSymbol {
  return {...ZERO_FRAME, id: newId(), name, data: {}}
}

/** 已有则移除；否则添加（互斥组先移除组内其它符号） */
export function toggleNoteMark(host: NoteMarkHost, name: N): void {
  const marks = ensureMarks(host)
  const existing = marks.findIndex((sym) => sym.name === name)
  if (existing >= 0) {
    marks.splice(existing, 1)
    return
  }
  const group = noteMarkGroup(name)
  if (group?.exclusive) {
    for (let i = marks.length - 1; i >= 0; i--) {
      if (group.names.includes(marks[i]!.name)) marks.splice(i, 1)
    }
  }
  marks.push(createNoteMark(name))
}

export function removeNoteMark(host: NoteMarkHost, symbolId: string): boolean {
  const marks = listNoteMarks(host)
  const idx = marks.findIndex((sym) => sym.id === symbolId)
  if (idx < 0) return false
  marks.splice(idx, 1)
  return true
}

/** 原位换成同组另一个符号，保留拖拽偏移；宿主已有同名符号时不换 */
export function replaceNoteMark(host: NoteMarkHost, symbol: SingleNoteAffiliatedSymbol, name: N): boolean {
  if (symbol.name === name) return false
  if (listNoteMarks(host).some((sym) => sym !== symbol && sym.name === name)) return false
  symbol.name = name
  return true
}

export function resetNoteMarkOffset(symbol: SingleNoteAffiliatedSymbol): void {
  symbol.relativeX = 0
  symbol.relativeY = 0
}

export function hasNoteMarkOffset(symbol: SingleNoteAffiliatedSymbol): boolean {
  return (symbol.relativeX ?? 0) !== 0 || (symbol.relativeY ?? 0) !== 0
}
