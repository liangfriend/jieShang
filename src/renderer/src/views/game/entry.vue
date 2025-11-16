<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import type { StoryNode } from '@renderer/types'
import { ElMessage } from 'element-plus'

// ------------------- 数据 & 路由 -------------------
const router = useRouter()
const route = useRoute()

// 查询参数判断是否为测试模式
const isTestMode = computed(() => route.query.test === 'true')
const { nodeMap } = useNodeManager()
// 故事节点（标题）
const storyNode = computed(() => {
  console.log('chicken', nodeMap.value)
  return nodeMap.value.get(1) as StoryNode
})
// test game
const type = computed(() => {
  return route.query.type
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
const saveList = ref([
  { id: 1001, name: '初次存档', time: '2025-01-01 12:00' },
  { id: 1002, name: '章节2', time: '2025-01-02 18:12' }
])

// 提交新建存档
const createNewSave = async () => {
  if (!newSaveName.value) {
    ElMessage.warning('请输入存档名')
    return
  }

  // 🚀TODO 调用后端接口，如：
  // const res = await api.createSave({ name: newSaveName.value });

  // 用存档数据更新useNodeManager
  // updateLoadedGameData()
  const newId = Date.now() // 模拟存档id

  ElMessage.success('存档创建成功！')
  newSaveDialog.value = false

  router.replace({
    path: '/jieShang/game/game',
    query: { saveId: newId }
  })
}

// 点击加载某个存档
const loadSave = async (saveId: number) => {
  ElMessage.success('正在载入存档...')
  router.replace({
    path: '/jieShang/game/game',
    query: { saveId }
  })
}

// ------------------- 菜单点击 -------------------
const onMenuClick = (key: string) => {
  switch (key) {
    case 'start':
      newSaveDialog.value = true
      break

    case 'loadSave':
      loadDialog.value = true
      break

    case 'test':
      router.replace({ path: '/game/game', query: route.query })
      break

    case 'exit':
      window.close()
      break
  }
}
</script>

<template>
  <div class="w-screen h-screen bg-black text-white relative overflow-hidden" v-if="storyNode">
    <!-- 游戏标题 -->
    <div
      class="absolute top-[10%] left-1/2 -translate-x-1/2 text-6xl font-bold tracking-widest drop-shadow-lg"
    >
      {{ storyNode.nodeName }}
    </div>

    <!-- 菜单 -->
    <div class="absolute top-[35%] left-[12%] flex flex-col gap-6">
      <div
        v-for="item in menuList"
        :key="item.key"
        class="text-3xl cursor-pointer opacity-80 pl-4 relative transition-all duration-200"
        @click="onMenuClick(item.key)"
      >
        <!-- hover效果 -->
        <span class="menu-text">{{ item.label }}</span>
      </div>
    </div>

    <!-- 开始游戏弹窗 -->
    <el-dialog v-model="newSaveDialog" title="新建存档" width="400px">
      <el-input v-model="newSaveName" placeholder="请输入存档名" />

      <template #footer>
        <el-button @click="newSaveDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewSave">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 加载存档弹窗 -->
    <el-dialog v-model="loadDialog" title="选择存档" width="600px">
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="save in saveList"
          :key="save.id"
          class="p-4 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer transition"
          @click="loadSave(save.id)"
        >
          <div class="text-xl font-bold mb-2">{{ save.name }}</div>
          <div class="text-gray-400 text-sm">{{ save.time }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="loadDialog = false">关闭</el-button>
      </template>
    </el-dialog>
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
</style>
