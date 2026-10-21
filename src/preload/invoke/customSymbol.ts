import { ipcRenderer } from 'electron'

/** data 为符号 JSON（content / w / h 及规则字段），结构见渲染进程 types/customSymbol */
export type CustomSymbolPayload = {
  name?: string
  kind?: 'note' | 'slot' | 'measure'
  data?: unknown
}

export const customSymbolInvoke = {
  create: (payload: CustomSymbolPayload) => ipcRenderer.invoke('customSymbol:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('customSymbol:delete', id),
  update: (id: number | string, payload: Omit<CustomSymbolPayload, 'kind'>) =>
    ipcRenderer.invoke('customSymbol:update', id, payload),
  list: (kind?: 'note' | 'slot' | 'measure') => ipcRenderer.invoke('customSymbol:list', kind)
}
