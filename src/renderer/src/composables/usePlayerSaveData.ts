import { SaveData } from '@renderer/types'

export function usePlayerSaveData(saveId: number) {
  // 通过saveId查找数据库获得存档数据
  let saveData: SaveData = {
    saveId: 1, // 存档id
    gameId: 122, // 游戏id
    saveName: '存档1', // 存档名,
    data: { sceneId: 432 }, // 存储相关数据，当前场景进度id
    editorNodeList: [] // 游戏数据
  }

  // 创建新游戏
  function createNewSave(gameId: number, saveName: string) {
    // 通过gameId获取游戏原始editorNodeList
    saveData = {
      id: -1,
      gameId: 122, // 游戏id
      saveName: '存档1', // 存档名,
      data: { sceneId: 432 }, // 存储相关数据，当前场景进度id
      editorNodeList: [] // 游戏数据
    }
    // 载入游戏
    load()
    // 调接口保存
  }

  // 载入存档
  function load() {
    // 将存档放到localStorage
    // updateLoadedGameData()
  }

  // 保存进度
  function save() {}

  return { ...saveData, save, load }
}
