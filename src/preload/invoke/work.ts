import { ipcRenderer } from 'electron'

export const workInvoke = {
  create: (payload) => ipcRenderer.invoke('work:create', payload),
  delete: (id) => ipcRenderer.invoke('work:delete', id),
  update: (id, payload) => ipcRenderer.invoke('work:update', id, payload),
  query: (filters) => ipcRenderer.invoke('work:query', filters),
  list: () => ipcRenderer.invoke('work:list'),
  searchByName: (name) => ipcRenderer.invoke('work:searchByName', name)
}
