import { ipcRenderer } from 'electron'

export type MediaCreatePayload = {
  name: string
  file: ArrayBuffer | Uint8Array
  originalName?: string
}

export const videoInvoke = {
  create: (payload: MediaCreatePayload) => ipcRenderer.invoke('video:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('video:delete', id),
  update: (id: number | string, payload: Partial<{ name: string }>) =>
    ipcRenderer.invoke('video:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('video:get', id),
  query: (filters: Partial<{ id: number | string; name: string }>) =>
    ipcRenderer.invoke('video:query', filters),
  list: () => ipcRenderer.invoke('video:list'),
  searchByName: (name: string) => ipcRenderer.invoke('video:searchByName', name)
}
