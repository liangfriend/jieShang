import { ipcRenderer } from 'electron'

export const saveInvoke = {
  create: (payload) => ipcRenderer.invoke('save:create', payload),
  delete: (id) => ipcRenderer.invoke('save:delete', id),
  update: (id, payload) => ipcRenderer.invoke('save:update', id, payload),
  query: (filters) => ipcRenderer.invoke('save:query', filters),
  list: () => ipcRenderer.invoke('save:list')
}
