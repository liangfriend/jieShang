<script lang="ts" setup>
// 节点功能
import { useRoute, useRouter } from 'vue-router'
import { computed, CSSProperties, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { StoryNode } from '@renderer/types'
import { LayerEnum, NodeEnum } from '@renderer/enum'
import ImageNodeBox from '@renderer/views/game/components/imageNodeBox.vue'
import VideoNodeBox from '@renderer/views/game/components/videoNodeBox.vue'
import CaptionNodeBox from '@renderer/views/game/components/captionNodeBox.vue'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { useGame } from '@renderer/composables/useGame'
import FilterNodeBox from '@renderer/views/game/components/filterNodeBox.vue'
import CurtainNodeBox from '@renderer/views/game/components/curtainNodeBox.vue'
import CustomNodeBox from '@renderer/views/game/components/customNodeBox.vue'
import { types } from 'sass'

const router = useRouter()
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
// test game
const type = computed(() => {
  return route.query.type
})
const gameId = computed((): number => {
  const id = +route.query.gameId!
  return id as number
})
const sceneId = computed((): number => {
  return +route.query.sceneId
})
const storyNode = computed((): StoryNode => {
  return groupedNodes.value?.[NodeEnum.Story]?.[0]?.node as StoryNode
})

// 点击字幕
function captionStatusChange() {}

const route = useRoute()
const svgStyle = computed((): CSSProperties => {
  return {
    pointerEvents: 'none'
  }
})
watch(storyNode.value, () => {
  // 如果路由有sceneId，则从此场景开始
  if (sceneId.value !== -1) {
    startScene(sceneId.value)
  } else {
    startScene(storyNode.value.entrySceneId)
  }
})
const exitDialogVisible = ref(false)

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

onMounted(() => {
  document.addEventListener('keyup', esc)
  if (!storyNode.value) {
    throw new Error('请添加一个唯一的故事节点')
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('keyup', esc)
})
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
</style>
