import type {
  ExtraSymbolInput,
  ExtraSymbolKind,
  MusicScore,
  SingleMeasureAffiliatedSymbol,
  SingleNoteAffiliatedSymbol
} from '@deciphony/renderer'
import {
  addExtraSymbol,
  createExtraSymbol,
  createSingleMeasureAffiliatedSymbol,
  createSingleNoteAffiliatedSymbol,
  findExtraSymbol,
  findExtraSymbolUsages,
  removeExtraSymbol,
  updateExtraSymbol
} from '@deciphony/extensions/dr-edit/score-builder'
import { toRaw } from 'vue'
import type { CustomSymbolRecord } from '@renderer/types/customSymbol'

/**
 * 自定义符号库 → 曲谱：引用时把库里的符号整份复制进 MusicScore.extra*Symbol，
 * 附属符号 name 填 skinKey。库里删除符号不影响曲谱里的副本。
 */

/** 属性栏开放的种类（slot 暂未使用） */
export type CustomSymbolHostKind = Extract<ExtraSymbolKind, 'note' | 'measure'>

export type CustomSymbolHost = {
  affiliatedSymbols?: (SingleNoteAffiliatedSymbol | SingleMeasureAffiliatedSymbol)[]
}

function toExtraInput<K extends ExtraSymbolKind>(record: CustomSymbolRecord<K>): ExtraSymbolInput<K> {
  const data = JSON.parse(JSON.stringify(toRaw(record.data)))
  return { ...data, name: record.name, skinKey: record.skinKey } as ExtraSymbolInput<K>
}

/** 曲谱里没有则加入；已有同 skinKey 时按库里最新内容覆盖。种类冲突返回 false */
export function syncCustomSymbolToScore(score: MusicScore, record: CustomSymbolRecord): boolean {
  const input = toExtraInput(record)
  const found = findExtraSymbol(score, record.skinKey)
  if (!found) {
    addExtraSymbol(score, record.kind, input)
    return true
  }
  if (found.kind !== record.kind) return false
  updateExtraSymbol(score, record.kind, record.skinKey, createExtraSymbol(record.kind, input))
  return true
}

/** 库里改了符号：当前曲谱已有副本时同步，没有则不动 */
export function refreshCustomSymbolInScore(score: MusicScore, record: CustomSymbolRecord): void {
  const found = findExtraSymbol(score, record.skinKey)
  if (found?.kind === record.kind) syncCustomSymbolToScore(score, record)
}

export function hostHasCustomSymbol(host: CustomSymbolHost | null | undefined, skinKey: string): boolean {
  return host?.affiliatedSymbols?.some((sym) => sym.name === skinKey) ?? false
}

/** 曲谱里已无引用的副本一并移除，避免 svg 内容残留 */
function pruneUnused(score: MusicScore, kind: ExtraSymbolKind, skinKey: string): void {
  if (findExtraSymbolUsages(score, skinKey).length === 0) removeExtraSymbol(score, kind, skinKey)
}

/** 宿主已挂该符号则移除；否则复制进曲谱并挂到宿主 affiliatedSymbols */
export function toggleCustomSymbol(score: MusicScore, host: CustomSymbolHost, record: CustomSymbolRecord): void {
  const list = (host.affiliatedSymbols ??= [])
  const existing = list.findIndex((sym) => sym.name === record.skinKey)
  if (existing >= 0) {
    list.splice(existing, 1)
    pruneUnused(score, record.kind, record.skinKey)
    return
  }
  if (!syncCustomSymbolToScore(score, record)) return
  list.push(
    record.kind === 'measure'
      ? createSingleMeasureAffiliatedSymbol(record.skinKey)
      : createSingleNoteAffiliatedSymbol(record.skinKey)
  )
}
