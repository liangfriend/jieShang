import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { CustomSymbolData, CustomSymbolKind, CustomSymbolRecord } from '@renderer/types/customSymbol'

type CustomSymbolRow = {
  id: number
  name: string
  kind: CustomSymbolKind
  skin_key: string
  data: string
  created_at?: string
  updated_at?: string
}

function mapRow(row: CustomSymbolRow): CustomSymbolRecord | null {
  try {
    const data = JSON.parse(row.data) as CustomSymbolData
    if (!data || typeof data.content !== 'string') return null
    return {
      id: row.id,
      name: row.name,
      kind: row.kind,
      skinKey: row.skin_key,
      data,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  } catch {
    return null
  }
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value)))
}

/** 曲谱编辑自定义符号库（custom_symbol 表），各属性栏共用一份 */
export const useCustomSymbolStore = defineStore('customSymbol', () => {
  const symbols = ref<CustomSymbolRecord[]>([])
  const loaded = ref(false)
  let loading: Promise<void> | null = null

  async function reload(): Promise<void> {
    const res = await window.api.customSymbol.list()
    if (!res?.success || !Array.isArray(res.data)) throw new Error(res?.error || 'load custom symbols failed')
    symbols.value = (res.data as CustomSymbolRow[])
      .map(mapRow)
      .filter((item): item is CustomSymbolRecord => item != null)
    loaded.value = true
  }

  function ensureLoaded(): Promise<void> {
    if (loaded.value) return Promise.resolve()
    loading ??= reload().finally(() => {
      loading = null
    })
    return loading
  }

  function listByKind<K extends CustomSymbolKind>(kind: K): CustomSymbolRecord<K>[] {
    return symbols.value.filter((item) => item.kind === kind) as CustomSymbolRecord<K>[]
  }

  async function create<K extends CustomSymbolKind>(
    name: string,
    kind: K,
    data: CustomSymbolData<K>
  ): Promise<CustomSymbolRecord<K>> {
    const res = await window.api.customSymbol.create({ name: name.trim(), kind, data: plain(data) })
    const record = res?.success && res.data ? mapRow(res.data) : null
    if (!record) throw new Error(res?.error || 'create custom symbol failed')
    symbols.value = [...symbols.value, record]
    return record as CustomSymbolRecord<K>
  }

  async function update<K extends CustomSymbolKind>(
    id: number,
    name: string,
    data: CustomSymbolData<K>
  ): Promise<CustomSymbolRecord<K>> {
    const res = await window.api.customSymbol.update(id, { name: name.trim(), data: plain(data) })
    const record = res?.success && res.data ? mapRow(res.data) : null
    if (!record) throw new Error(res?.error || 'update custom symbol failed')
    symbols.value = symbols.value.map((item) => (item.id === id ? record : item))
    return record as CustomSymbolRecord<K>
  }

  async function remove(id: number): Promise<void> {
    const res = await window.api.customSymbol.delete(id)
    if (!res?.success) throw new Error(res?.error || 'delete custom symbol failed')
    symbols.value = symbols.value.filter((item) => item.id !== id)
  }

  return { symbols, loaded, ensureLoaded, reload, listByKind, create, update, remove }
})
