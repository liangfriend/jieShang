import { ipcRenderer } from 'electron'

export type AudioCreatePayload = {
  /** 用户展示名称 */
  name: string
  /** 文件二进制（ArrayBuffer / Uint8Array） */
  file: ArrayBuffer | Uint8Array
  /** 原始文件名，仅用于保留扩展名 */
  originalName?: string
}

export const audioInvoke = {
  create: (payload: AudioCreatePayload) => ipcRenderer.invoke('audio:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('audio:delete', id),
  update: (id: number | string, payload: Partial<{ name: string }>) =>
    ipcRenderer.invoke('audio:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('audio:get', id),
  query: (filters: Partial<{ id: number | string; name: string }>) =>
    ipcRenderer.invoke('audio:query', filters),
  list: () => ipcRenderer.invoke('audio:list'),
  searchByName: (name: string) => ipcRenderer.invoke('audio:searchByName', name)
}
