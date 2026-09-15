import { ipcRenderer } from 'electron'

export type MediaCreatePayload = {
  name: string
  file: ArrayBuffer | Uint8Array
  originalName?: string
}

export const imageInvoke = {
  create: (payload: MediaCreatePayload) => ipcRenderer.invoke('image:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('image:delete', id),
  update: (id: number | string, payload: Partial<{ name: string }>) =>
    ipcRenderer.invoke('image:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('image:get', id),
  query: (filters: Partial<{ id: number | string; name: string }>) =>
    ipcRenderer.invoke('image:query', filters),
  list: () => ipcRenderer.invoke('image:list'),
  searchByName: (name: string) => ipcRenderer.invoke('image:searchByName', name)
}
