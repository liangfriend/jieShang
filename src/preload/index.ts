import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { saveInvoke } from './invoke/save'
import { gameInvoke } from './invoke/game'
import { resourceInvoke } from './invoke/resource'
import { scoreInvoke } from './invoke/score'
import { workInvoke } from './invoke/work'
import { fileInvoke } from './invoke/file'
import { windowInvoke } from './invoke/window'
import { groupInvoke } from './invoke/group'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', {
      file: fileInvoke,
      game: gameInvoke,
      resource: resourceInvoke,
      save: saveInvoke,
      score: scoreInvoke,
      work: workInvoke,
      window: windowInvoke,
      group: groupInvoke
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
