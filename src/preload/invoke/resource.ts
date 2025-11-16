import { ipcRenderer } from 'electron'

export const resourceInvoke = {
  create: (payload) => ipcRenderer.invoke('resource:create', payload),
  delete: (id) => ipcRenderer.invoke('resource:delete', id),
  update: (id, payload) => ipcRenderer.invoke('resource:update', id, payload),
  query: (filters) => ipcRenderer.invoke('resource:query', filters),
  list: () => ipcRenderer.invoke('resource:list')
}
