import { ipcRenderer } from 'electron'

export const groupInvoke = {
  create: (payload) => ipcRenderer.invoke('group:create', payload),
  delete: (id) => ipcRenderer.invoke('group:delete', id),
  update: (id, payload) => ipcRenderer.invoke('group:update', id, payload),
  query: (filters) => ipcRenderer.invoke('group:query', filters),
  list: () => ipcRenderer.invoke('group:list')
}
