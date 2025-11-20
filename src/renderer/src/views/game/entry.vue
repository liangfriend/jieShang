<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { updateLoadedEditorNodeList, useNodeManager } from '@renderer/composables/useNodeManager'
import type { SaveModel, StoryNode } from '@renderer/types'
import { ElMessage } from 'element-plus'
import { updateStaticResource } from '@renderer/composables/useStaticResource'
import { updateLoadedEditorInfo } from '@renderer/composables/useEditor'
import { updateLoadedGameData, useGameData } from '@renderer/composables/useGameData'

// ------------------- 数据 & 路由 -------------------
const router = useRouter()
const route = useRoute()

// ====================数据初始化======================
const { nodeMap } = useNodeManager()
const { gameData } = useGameData()
// test game
const type = computed(() => {
  return route.query.type
})
const gameId = computed((): number => {
  const id = +route.query.gameId!
  return id as number
})
const sceneId = computed((): number => {
  if (route.query.sceneId) {
    return +route.query.sceneId
  }
  return -1
})
// 故事节点（标题）
const storyNode = computed(() => {
  return nodeMap.value.get(1) as StoryNode
})

async function initData() {
  if (type.value === 'test') {
    const data = (await window.api.work.query({ id: gameId.value })).data?.[0]
    if (data) {
      const editorNodeList = JSON.parse(data.data).editorNodeList
      await updateLoadedEditorNodeList(editorNodeList)
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
    }
  } else if (type.value === 'game') {
    const data = (await window.api.game.query({ id: gameId.value })).data?.[0]
    if (data) {
      const editorNodeList = JSON.parse(data.data).editorNodeList
      await updateLoadedEditorNodeList(editorNodeList)
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
    }
  }
}

onMounted(async () => {
  await initData()
})

// ------------------- 菜单 -------------------
const menuList = computed(() => {
  if (type.value === 'test') {
    return [{ key: 'test', label: '测试游戏' }]
  }
  return [
    { key: 'start', label: '开始新游戏' },
    { key: 'loadSave', label: '加载存档' },
    { key: 'setting', label: '设置' },
    { key: 'exit', label: '退出游戏' }
  ]
})

// ------------------- 存档相关 -------------------

// 新建存档
const newSaveDialog = ref(false)
const newSaveName = ref('')

// 加载存档弹窗
const loadDialog = ref(false)

// 存档列表（后台接口）
const saveList = ref<SaveModel[]>([])

// 提交新建存档并进入游戏
const createNewSave = async () => {
  if (!newSaveName.value) {
    ElMessage.warning('请输入存档名')
    return
  }
  const save = (
    await window.api.save.create({
      game_id: gameId.value,
      name: newSaveName.value,
      data: JSON.stringify({ sceneId: -1, gameData: gameData })
    })
  ).data
  newSaveDialog.value = false
  router.replace({
    path: '/game/game',
    query: { saveId: save.id, gameId: gameId.value, sceneId: -1, type: type.value }
  })
}

async function getSaveList(gameId: number) {
  saveList.value = (await window.api.save.query({ game_id: gameId })).data
}

// 点击加载某个存档
const loadSave = async (save) => {
  const data = JSON.parse(save.data)

  router.replace({
    path: '/game/game',
    query: { type: type.value, saveId: save.id, gameId: gameId.value, sceneId: data.sceneId }
  })
}

// ------------------- 菜单点击 -------------------
async function onMenuClick(key: string) {
  switch (key) {
    case 'start':
      newSaveDialog.value = true
      break

    case 'loadSave': {
      await getSaveList(gameId.value)
      loadDialog.value = true
      break
    }
    case 'test':
      router.replace({
        path: '/game/game',
        query: { gameId: gameId.value, sceneId: sceneId.value, type: type.value }
      })
      break

    case 'exit':
      router.replace({
        path: '/home'
      })
      break
  }
}
</script>

<template>
  <div class="stack w-screen h-screen bg-black text-white" v-if="storyNode">
    <!-- ================== 背景层 ================== -->
    <div class="stack-item">
      <div class="game-bg w-full h-full">
        <!-- 这里你可以放背景图、粒子动画、视频背景等 -->
        <img class="bg-url" v-if="storyNode.bgUrl" :src="storyNode.bgUrl"></img>
      </div>
      <!-- 游戏标题 -->
      <div
        class="absolute top-[10%] left-1/2 -translate-x-1/2 text-6xl font-bold tracking-widest drop-shadow-lg"
        :style="{color:storyNode.fontColor || 'white'}"
      >
        {{ storyNode.nodeName }}
      </div>
    </div>
    <!-- ================== 功能层（UI 层）================== -->
    <div class="stack-item">
      <div>
        <!-- 菜单 -->
        <div class="absolute top-[35%] left-[12%] flex flex-col gap-6" :style="{color:storyNode.fontColor || 'white'}">
          <div
            v-for="item in menuList"
            :key="item.key"
            class="text-3xl cursor-pointer opacity-80 pl-4 relative transition-all duration-200"
            @click="onMenuClick(item.key)"
          >
            <span class="menu-text">{{ item.label }}</span>
          </div>
        </div>

        <!-- 开始游戏弹窗 -->
        <el-dialog v-model="newSaveDialog" title="新建存档" width="400px">
          <el-input v-model="newSaveName" placeholder="请输入存档名" />

          <template #footer>
            <el-button @click="newSaveDialog = false">取消</el-button>
            <el-button type="primary" @click="createNewSave">进入游戏</el-button>
          </template>
        </el-dialog>

        <!-- 加载存档弹窗 -->
        <el-dialog v-model="loadDialog" title="选择存档" width="600px">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="save in saveList"
              :key="save.id"
              class="p-4 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer transition"
              @click="loadSave(save)"
            >
              <div class="text-xl font-bold mb-2">{{ save.name }}</div>
            </div>
          </div>

          <template #footer>
            <el-button @click="loadDialog = false">关闭</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-text {
  transition: 0.2s;
  position: relative;
}

.menu-text:hover {
  opacity: 1;
  transform: translateX(12px);
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
}

/* 左侧竖线 */
.menu-text::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  width: 4px;
  height: 0%;
  background: #aaa;
  transition: 0.3s;
  transform: translateY(-50%);
}

.menu-text:hover::before {
  height: 100%;
  background: #fff;
}

.bg-url {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
