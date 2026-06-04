import { ipcRenderer } from 'electron'

export const scoreInvoke = {
  create: (payload: { name: string; data?: string }) =>
    ipcRenderer.invoke('score:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('score:delete', id),
  update: (id: number | string, payload: Partial<{ name: string; data: string }>) =>
    ipcRenderer.invoke('score:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('score:get', id),
  query: (filters: Partial<{ id: number | string; name: string }>) =>
    ipcRenderer.invoke('score:query', filters),
  list: () => ipcRenderer.invoke('score:list'),
  searchByName: (name: string) => ipcRenderer.invoke('score:searchByName', name)
}
