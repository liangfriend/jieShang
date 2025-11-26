// =============================== 撤销/恢复功能 ========================================
import { EditorInfo, EditorNode, OperationHistory, Prefab } from '@renderer/types'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { useEditor } from '@renderer/composables/useEditor'
import { useGameData } from '@renderer/composables/useGameData'
import { Ref } from 'vue'

const undoStack: OperationHistory[] = []
const redoStack: OperationHistory[] = []

/*
 * 目前的话，只支持editorNodeList和prefabList的数组项增删的撤销恢复
 * */
export function useOperationHistory({
  editorNodeList,
  prefabList,
  editorInfo,
  gameData
}: Partial<{
  editorNodeList: Ref<EditorNode[]>
  prefabList: Ref<Prefab[]>
  editorInfo: Ref<EditorInfo>
  gameData: Ref<string>
}>) {
  // 保存历史记录
  function pushHistory(prevState: Partial<OperationHistory>) {
    undoStack.push(JSON.parse(JSON.stringify(prevState)))
    // 只要有新操作进来，就清空 redo
    redoStack.length = 0
    console.log('chicken')
  }

  // 撤销
  function undo(data: Partial<OperationHistory>) {
    if (undoStack.length === 0) return

    redoStack.push(JSON.parse(JSON.stringify(data)))

    const prev = undoStack.pop()
    const newData: OperationHistory = JSON.parse(JSON.stringify(prev))
    // 更新editorNodewList
    if (newData.editorNodeList && editorNodeList) editorNodeList.value = newData.editorNodeList
    //更新editorInfo
    if (newData.editorInfo && editorInfo) editorInfo.value = newData.editorInfo
    //更新gameData
    if (newData.gameData && gameData) gameData.value = newData.gameData
    //更新prefabList
    if (newData.prefabList && prefabList) prefabList.value = newData.prefabList
  }

  // 重做
  function redo(data: Partial<OperationHistory>) {
    if (redoStack.length === 0) return

    undoStack.push(JSON.parse(JSON.stringify(data)))

    const next = redoStack.pop()
    const newData = JSON.parse(JSON.stringify(next))
    // 更新editorNodewList
    if (newData.editorNodeList && editorNodeList) editorNodeList.value = newData.editorNodeList
    //更新editorInfo
    if (newData.editorInfo && editorInfo) editorInfo.value = newData.editorInfo
    //更新gameData
    if (newData.gameData && gameData) gameData.value = newData.gameData
    //更新prefabList
    if (newData.prefabList && prefabList) prefabList.value = newData.prefabList
  }

  return { pushHistory, redo, undo }
}
