import { ipcRenderer } from 'electron'

export const windowInvoke = {
  open: (name, route, options) => {
    return ipcRenderer.invoke('window:open', name, route, options)
  },
  close: (name) => ipcRenderer.invoke('window:close', name),
  focus: (name) => ipcRenderer.invoke('window:focus', name),
  get: (name) => ipcRenderer.invoke('window:get', name)
}
