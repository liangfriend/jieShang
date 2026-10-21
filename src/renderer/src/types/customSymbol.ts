import type { ExtraSymbolKind, ExtraSymbolMap } from '@deciphony/renderer'

/** note → 音符 / 休止符；measure → 小节；slot 暂未开放 */
export type CustomSymbolKind = ExtraSymbolKind

/** custom_symbol.data：曲谱自定义符号去掉 name / skinKey（由行字段提供） */
export type CustomSymbolData<K extends CustomSymbolKind = CustomSymbolKind> = Omit<
  ExtraSymbolMap[K],
  'name' | 'skinKey'
>

export type CustomSymbolRecord<K extends CustomSymbolKind = CustomSymbolKind> = {
  id: number
  name: string
  kind: K
  /** 内部生成、全局唯一 */
  skinKey: string
  data: CustomSymbolData<K>
  created_at?: string
  updated_at?: string
}
