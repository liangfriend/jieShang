<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { updateLoadedGameData } from '@renderer/composables/useGameData'
import { updateLoadedEditorNodeList } from '@renderer/composables/useNodeManager'
// 对游戏数据进行初始化
const route = useRoute()

onBeforeMount(async () => {
  const type = route.query.type
  console.log('chicken', 'onBeforeMount')
  if (type === 'test') {
    // 游戏测试
    const gameId = +route.query.gameId!
    const data = (
      await window.api.work.query({
        id: gameId
      })
    )?.[0]
    if (data) {
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
      const editorNodeList = JSON.parse(data.data).editorNodeList
      updateLoadedEditorNodeList(editorNodeList)
    }
  } else if (type === 'game') {
    // 正式游戏
    const gameId = +route.query.gameId!
    const data = (
      await window.api.game.query({
        id: gameId
      })
    )?.[0]
    if (data) {
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
      const editorNodeList = JSON.parse(data.data).editorNodeList
      console.log('chicken', JSON.parse(data.data))
      updateLoadedEditorNodeList(editorNodeList)
    }
  }
})
</script>

<template>
  <router-view></router-view>
</template>
<style scoped></style>
