import { ipcRenderer } from 'electron'

export type WorkCreatePayload = {
  name: string
  file: ArrayBuffer | Uint8Array
  score_id?: number | null
  originalName?: string
}

export type WorkUpdatePayload = Partial<{
  name: string
  score_id: number | null
  file: ArrayBuffer | Uint8Array
}>

export const workInvoke = {
  create: (payload: WorkCreatePayload) => ipcRenderer.invoke('work:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('work:delete', id),
  update: (id: number | string, payload: WorkUpdatePayload) =>
    ipcRenderer.invoke('work:update', id, payload),
  get: (id: number | string, includeScore?: boolean) =>
    ipcRenderer.invoke('work:get', id, includeScore),
  query: (filters: Partial<{ id: number | string; name: string; score_id: number }>) =>
    ipcRenderer.invoke('work:query', filters),
  list: () => ipcRenderer.invoke('work:list'),
  searchByName: (name: string) => ipcRenderer.invoke('work:searchByName', name),
  extractScore: (id: number | string) => ipcRenderer.invoke('work:extractScore', id)
}
