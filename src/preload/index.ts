import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { scoreInvoke } from './invoke/score'
import { workInvoke } from './invoke/work'
import { collectionInvoke } from './invoke/collection'
import { fileInvoke } from './invoke/file'
import { windowInvoke } from './invoke/window'
import { groupInvoke } from './invoke/group'
import { achievementInvoke } from './invoke/achievement'
import { noteSliceHighScoreInvoke } from './invoke/noteSliceHighScore'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', {
      file: fileInvoke,
      score: scoreInvoke,
      work: workInvoke,
      collection: collectionInvoke,
      achievement: achievementInvoke,
      noteSliceHighScore: noteSliceHighScoreInvoke,
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
