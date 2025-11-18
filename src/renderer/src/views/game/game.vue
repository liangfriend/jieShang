<script lang="ts" setup>
// 节点功能
import { useRoute, useRouter } from 'vue-router'
import { computed, CSSProperties, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { StoryNode } from '@renderer/types'
import { LayerEnum, NodeEnum } from '@renderer/enum'
import ImageNodeBox from '@renderer/views/game/components/imageNodeBox.vue'
import VideoNodeBox from '@renderer/views/game/components/videoNodeBox.vue'
import CaptionNodeBox from '@renderer/views/game/components/captionNodeBox.vue'
import { updateLoadedEditorNodeList, useNodeManager } from '@renderer/composables/useNodeManager'
import { useGame } from '@renderer/composables/useGame'
import FilterNodeBox from '@renderer/views/game/components/filterNodeBox.vue'
import CurtainNodeBox from '@renderer/views/game/components/curtainNodeBox.vue'
import CustomNodeBox from '@renderer/views/game/components/customNodeBox.vue'
import { types } from 'sass'
import { updateLoadedGameData, useGameData } from '@renderer/composables/useGameData'
const router = useRouter()
const route = useRoute()
// ====================数据初始化======================
const { editorNodeList, nodeMap, editorNodeMap, groupedNodes, clearNodeManager } = useNodeManager()
const {
  curCaptionId,
  curSceneId,
  curDialogueId,
  doAction,
  viewerNodeMap,
  viewerNodeGroups,
  startCaption,
  startDialogue,
  viewerKeys,
  startScene,
  viewerCurtainNodeMap
} = useGame()
const { gameData } = useGameData()
const type = computed(() => {
  return route.query.type
})
const gameId = computed((): number => {
  const id = +route.query.gameId!
  return id as number
})
const sceneId = computed((): number => {
  return +route.query.sceneId!
})
const storyNode = computed((): StoryNode => {
  return groupedNodes.value?.[NodeEnum.Story]?.[0]?.node as StoryNode
})
async function initData() {
  console.log('chicken', type.value)
  if (type.value === 'test') {
    const data = (await window.api.work.query({ id: gameId.value }))?.[0]
    console.log('chicken', data)
    if (data) {
      const editorNodeList = JSON.parse(data.data).editorNodeList
      await updateLoadedEditorNodeList(editorNodeList)
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
    }
  } else if (type.value === 'game') {
    console.log('chicken')
    const data = (await window.api.game.query({ id: gameId.value }))?.[0]

    if (data) {
      const editorNodeList = JSON.parse(data.data).editorNodeList
      await updateLoadedEditorNodeList(editorNodeList)
      // TODO 这里后续使用了存档，要用存档的gameData
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
    }
  }
  console.log('chicken', sceneId.value)
  // 如果路由有sceneId，则从此场景开始
  if (sceneId.value !== -1) {
    console.log('chickenstartScene')
    await startScene(sceneId.value)
  } else {
    await startScene(storyNode.value.entrySceneId)
  }
}
onMounted(async () => {
  console.log('chicken')
  await initData()
})

// ======================样式====================
const svgStyle = computed((): CSSProperties => {
  return {
    pointerEvents: 'none'
  }
})
// ======================退出游戏功能====================
const exitDialogVisible = ref(false)
onMounted(() => {
  document.addEventListener('keyup', esc)
})
onBeforeUnmount(() => {
  document.removeEventListener('keyup', esc)
})
function esc(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    console.log('chicken', e)

    exitDialogVisible.value = !exitDialogVisible.value
  }
}
function exit() {
  console.log('chicken', type.value)
  if (type.value === 'test') {
    router.replace({
      path: '/game/entry',
      query: { gameId: gameId.value, type: type.value }
    })
  } else if (type.value === 'game') {
    router.replace({
      path: '/game/entry',
      query: { gameId: gameId.value, type: type.value }
    })
  }
}
</script>
<template>
  <div class="stack" v-if="storyNode">
    <div :key="curSceneId" class="stack-item background-layer">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.Background]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.Background]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.Background]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div :key="curSceneId" class="stack-item behind-object-layer">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.BehindObject]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.BehindObject]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.BehindObject]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div :key="curSceneId" class="stack-item character-layer">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.Character]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.Character]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.Character]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div :key="curSceneId" class="stack-item front-object-layer">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.FrontObject]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.FrontObject]"
          :key="item.node.id"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.FrontObject]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div :key="curSceneId" class="stack-item effect-layer">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.Effect]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.Effect]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <filter-node-box
          v-for="item in viewerNodeGroups.filters"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :filter-node="item.node"
        ></filter-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.Effect]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div :key="curSceneId" class="stack-item operation-layer">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.Operation]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.Operation]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <caption-node-box
          v-for="item in viewerNodeGroups.captions"
          :key="item.node.id"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :captionNode="item.node"
          :layout="item.layout"
          @status-change="captionStatusChange"
        ></caption-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.Operation]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div class="stack-item curtain-layer" comment="幕布层不跟随场景刷新，所以不加key">
      <svg
        :style="svgStyle"
        :viewBox="`0 0 ${+storyNode.width} ${+storyNode.height}`"
        height="100%"
        preserveAspectRatio="none"
        width="100%"
      >
        <image-node-box
          v-for="item in viewerNodeGroups.images[LayerEnum.Curtain]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :image-node="item.node"
          :layout="item.layout"
        ></image-node-box>
        <video-node-box
          v-for="item in viewerNodeGroups.videos[LayerEnum.Curtain]"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :layout="item.layout"
          :video-node="item.node"
        ></video-node-box>
        <curtain-node-box
          v-for="[index, item] in viewerCurtainNodeMap"
          :canvas-height="+storyNode.height"
          :canvas-width="+storyNode.width"
          :curtain-node="item"
        ></curtain-node-box>
        <custom-node-box
          v-for="item in viewerNodeGroups.customs[LayerEnum.Curtain]"
          :custom-node="item.node"
          :layout="item.layout"
        ></custom-node-box>
      </svg>
    </div>
    <div
      v-if="type === 'test'"
      class="stack-item test-layer"
      comment="测试层，不参与游戏，放数据的"
    >
      <div class="data-box">
        <div>当前场景id:{{ curSceneId }}</div>
        <div>当前对话id:{{ curDialogueId }}</div>
        <div>当前字幕id:{{ curCaptionId }}</div>

        {{ gameData }}
      </div>
    </div>
  </div>
  <el-dialog v-model="exitDialogVisible" title="提示">
    <div>退出游戏？</div>

    <template #footer>
      <el-button @click="exitDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="exit">确认</el-button>
    </template>
  </el-dialog>
</template>
<style scoped>
.caption-text {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 20px;
  padding: 16px;
  box-sizing: border-box;
  user-select: none;
  pointer-events: none;
  white-space: pre-wrap;
  font-weight: 500;
  font-family: 'Microsoft YaHei', sans-serif;
}
.data-box {
  width: fit-content;

  background-color: rgba(0, 0, 0, 0.2);
}
</style>
