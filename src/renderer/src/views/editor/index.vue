<script lang="ts" setup>
import { computed, CSSProperties, onBeforeMount, provide, ref } from 'vue'
import {
  ActionNode,
  CaptionNode,
  DialogueNode,
  EditorNode,
  EngineNode,
  OptionNode,
  SceneNode,
  StoryNode
} from '@renderer/types'
import {
  ActionTypeEnum,
  EditorBoxEnum,
  FilterTypeEnum,
  LayerEnum,
  LayoutPositionEnum,
  NodeEnum,
  ObjectFitEnum
} from '@renderer/enum'
import { updateLoadedEditorNodeList, useNodeManager } from '@renderer/composables/useNodeManager'
import NormalRectBox from './components/normalRectBox.vue'
import RightTools from './components/rightTools.vue'
import LeftDrawer from './components/leftDrawer.vue'
import StaticResourcesDialog from './components/staticResourcesDialog.vue'
import { editorNodeTemplate } from '@renderer/utils/nodeTemplate'
import { updateLoadedEditorInfo, useEditor } from '@renderer/composables/useEditor'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import RoundedRectBox from './components/roundedRectBox.vue'
import MonacoEditor from '@renderer/components/monacoEditor.vue'
import { updateLoadedGameData, useGameData } from '@renderer/composables/useGameData'
import { updateStaticResource } from '@renderer/composables/useStaticResource'
// 设置窗口类型
sessionStorage.setItem('editorNodeListType', 'editor')
// 编辑器功能
const { editorInfo, resetEditorInfo } = useEditor()
const { gameData } = useGameData()
const isPanning = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

const worktopStyle = computed(
  (): CSSProperties => ({
    position: 'absolute',
    width: `${editorInfo.value.width}px`,
    height: `${editorInfo.value.height}px`, // transformOrigin默认坐标是50% 50%
    transformOrigin: '0 0 ',
    transform: `scale(${editorInfo.value.scale}) translate(${editorInfo.value.left}px,${editorInfo.value.top}px) `, // 为了跟子组件保持一致，scale放在translate之前
    backgroundColor: '#fafafa',
    transition: isPanning.value ? 'none' : 'transform 0.1s ease'
  })
)

function onMouseDown(e: MouseEvent) {
  isPanning.value = true
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function onMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  console.log('chicken', editorInfo.value)
  const scale = editorInfo.value.scale
  const dx = (e.clientX - lastMouse.value.x) / scale
  const dy = (e.clientY - lastMouse.value.y) / scale
  editorInfo.value.left += dx
  editorInfo.value.top += dy
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function onMouseUp() {
  isPanning.value = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.min(3, Math.max(0.2, editorInfo.value.scale + delta))
  editorInfo.value.scale = newScale
}

// 节点功能
const { editorNodeList, nodeMap, editorNodeMap, addNode, groupedNodes, clearNodeManager } =
  useNodeManager()

// 当前选中节点
const curSelectedNode = ref<EditorNode | null>(null)
// 节点连接线数据
const nodeLinkList = computed(
  (): { sort: number; data: [[number, number], [number, number]] }[] => {
    const lineList: { sort: number; data: [[number, number], [number, number]] }[] = []

    let i = 0 // 作为 index 计数

    editorNodeList.value.forEach((item) => {
      const type = item.node.nodeType as NodeEnum

      // 生成一条线并 push 的公共方法
      const pushLine = (targetNode: EditorNode, sort: number) => {
        const line: [[number, number], [number, number]] = [
          [item.layout.left + item.layout.width / 2, item.layout.top + item.layout.height / 2],
          [
            targetNode.layout.left + targetNode.layout.width / 2,
            targetNode.layout.top + targetNode.layout.height / 2
          ]
        ]

        lineList.push({
          sort: sort,
          data: line
        })
      }

      if (type === NodeEnum.Story) {
        const node = item.node as StoryNode
        if (editorNodeMap.value.has(node.entrySceneId)) {
          pushLine(editorNodeMap.value.get(node.entrySceneId)!, 0)
        }
      } else if (type === NodeEnum.Scene) {
        const node = item.node as SceneNode
        for (const [index, dialogueId] of node.initDialogueIds.entries()) {
          if (editorNodeMap.value.has(dialogueId)) {
            pushLine(editorNodeMap.value.get(dialogueId)!, index)
          }
        }
      } else if (type === NodeEnum.Dialogue) {
        const node = item.node as DialogueNode
        for (const [index, captionId] of node.initCaptionIds.entries()) {
          if (editorNodeMap.value.has(captionId)) {
            pushLine(editorNodeMap.value.get(captionId)!, index)
          }
        }
      } else if (type === NodeEnum.Caption) {
        const node = item.node as CaptionNode
        for (const [index, optionId] of node.optionIds.entries()) {
          if (editorNodeMap.value.has(optionId)) {
            pushLine(editorNodeMap.value.get(optionId)!, index)
          }
        }
      } else if (type === NodeEnum.Option) {
        const node = item.node as OptionNode
        let sort = 0
        for (let actionId of node.activeActionIds) {
          if (editorNodeMap.value.has(actionId)) {
            const editorActionNode = editorNodeMap.value.get(actionId) as EditorNode
            const actionNode = editorActionNode?.node as ActionNode
            if (actionNode.actionType === ActionTypeEnum.Next && actionNode.targetId) {
              const targetNode = editorNodeMap.value.get(actionNode.targetId)
              if (targetNode) {
                pushLine(targetNode, sort)
                sort++
              }
            }
          }
        }
      }
    })

    return lineList
  }
)

function addEditorNode(nodeType: NodeEnum) {
  const node: EditorNode = editorNodeTemplate(nodeType)
  const scale = editorInfo.value.scale

  // 容器视口宽高
  const containerRect = document.querySelector('.ds-ec-left')?.getBoundingClientRect()!
  const containerWidth = containerRect?.width / scale // 转换为缩放后
  const containerHeight = containerRect?.height / scale // 转换为缩放后

  if ([NodeEnum.Story, NodeEnum.Scene, NodeEnum.Dialogue].includes(nodeType)) {
    node.layout.width = 400 // 宽高传入后已经展示为缩放后的效果，所以不用除scale
    node.layout.height = 200
    node.boxType = EditorBoxEnum.NormalRect
    node.layout.left = -editorInfo.value.left + containerWidth / 2 - node.layout.width / 2
    node.layout.top = -editorInfo.value.top + containerHeight / 2 - node.layout.height / 2
  } else if ([NodeEnum.Caption].includes(nodeType)) {
    node.layout.width = 400 // 宽高传入后已经展示为缩放后的效果，所以不用除scale
    node.layout.height = 100
    node.boxType = EditorBoxEnum.NormalRect
    node.layout.left = -editorInfo.value.left + containerWidth / 2 - node.layout.width / 2
    node.layout.top = -editorInfo.value.top + containerHeight / 2 - node.layout.height / 2
  } else if ([NodeEnum.Option].includes(nodeType)) {
    node.layout.width = 200 // 宽高传入后已经展示为缩放后的效果，所以不用除scale
    node.layout.height = 50
    node.boxType = EditorBoxEnum.RoundedRect
    node.layout.left = -editorInfo.value.left + containerWidth / 2 - node.layout.width / 2
    node.layout.top = -editorInfo.value.top + containerHeight / 2 - node.layout.height / 2
  } else {
    node.layout.width = 0 // 宽高传入后已经展示为缩放后的效果，所以不用除scale
    node.layout.height = 0
    node.boxType = EditorBoxEnum.None
    node.layout.left = 0
    node.layout.top = 0
  }
  addNode(node)
}

function reset() {
  resetEditorInfo()
  clearNodeManager()
  ElMessage.success('重置成功')
}

const router = useRouter()
const route = useRoute()
const viewKey = ref(Symbol())
const workId = computed(() => {
  return route.query.workId
})

// 保存编辑器和节点信息
async function save() {
  // 更新数据
  const data = {
    editorInfo: editorInfo.value,
    editorNodeList: editorNodeList.value,
    gameData: gameData.value
  }
  await window.api.work.update(workId.value, { data: JSON.stringify(data) })
  ElMessage.success('保存成功')
}

// 初始化数据
onBeforeMount(async () => {
  // 初始化资源列表
  const resourceList = await window.api.resource.list()
  updateStaticResource(resourceList)
  if (workId.value) {
    const data = (await window.api.work.query({ id: workId.value }))?.[0]
    if (data) {
      const editorNodeList = JSON.parse(data.data).editorNodeList
      updateLoadedEditorNodeList(editorNodeList)
      const gameData = JSON.parse(data.data).gameData
      updateLoadedGameData(gameData)
      const editorInfo = JSON.parse(data.data).editorInfo
      updateLoadedEditorInfo(editorInfo)
      viewKey.value = Symbol()
    }
  }
})

// 游戏预览
function startGame() {
  const route = `/game/entry?type=test&workId=${workId.value}`
  // window.open(url, '_blank')
  console.log('chicken', route, window.location.href)
  window.api.window.open('game', route, {})
}

// 生成常用节点
function generateNormalNode() {
  const storyNode = nodeMap.value.get(1) as StoryNode
  //底部字幕布局
  const bottomCaptionLayoutNode = {
    id: 2,
    nodeName: '底部字幕布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.LB,
    objectFit: ObjectFitEnum.Fill,
    left: 0.1 * storyNode.width,
    right: 0,
    top: 0,
    bottom: 0.1 * storyNode.width,
    width: 0.8 * storyNode.width,
    height: 0.3 * storyNode.width,
    rotation: 0,
    scale: 1
  } as EngineNode
  const bottomCaptionLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  bottomCaptionLayoutNodeE.node = bottomCaptionLayoutNode
  addNode(bottomCaptionLayoutNodeE)

  // 左侧人物布局
  const leftCharacterLayoutNode = {
    id: 3,
    nodeName: '左侧人物布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.LB,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0.25 * storyNode.width,
    height: 0.5 * storyNode.width,
    rotation: 0,
    scale: 1
  } as EngineNode
  const leftCharacterLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  leftCharacterLayoutNodeE.node = leftCharacterLayoutNode
  addNode(leftCharacterLayoutNodeE)
  // 右侧人物布局
  const rightCharacterLayoutNode = {
    id: 4,
    nodeName: '右侧人物布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.RB,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0.25 * storyNode.width,
    height: 0.5 * storyNode.width,
    rotation: 0,
    scale: 1
  } as EngineNode
  const rightCharacterLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  rightCharacterLayoutNodeE.node = rightCharacterLayoutNode
  addNode(rightCharacterLayoutNodeE)
  // 居中字幕布局
  const centerCaptionLayoutNode = {
    id: 5,
    nodeName: '居中字幕布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.LT,
    objectFit: ObjectFitEnum.Fill,
    left: 0.3 * storyNode.width,
    right: 0,
    top: 0.3 * storyNode.height,
    bottom: 0,
    width: 0.4 * storyNode.width,
    height: 0.4 * storyNode.height,
    rotation: 0,
    scale: 1
  } as EngineNode
  const centerCaptionLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  centerCaptionLayoutNodeE.node = centerCaptionLayoutNode
  addNode(centerCaptionLayoutNodeE)
  // 全屏背景布局
  const fullScreenLayoutNode = {
    id: 6,
    nodeName: '全屏背景布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.Background,
    applyPosition: LayoutPositionEnum.LT,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: storyNode.width,
    height: storyNode.height,
    rotation: 0,
    scale: 1
  } as EngineNode
  const fullScreenLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  fullScreenLayoutNodeE.node = fullScreenLayoutNode
  addNode(fullScreenLayoutNodeE)
  // 害羞滤镜
  const embarassedFilterNode = {
    id: 7,
    nodeName: '滤镜节点',
    nodeType: NodeEnum.Filter,
    filterType: FilterTypeEnum.Embarrassed
  } as EngineNode
  const embarassedFilterNodeE = editorNodeTemplate(NodeEnum.Custom)
  embarassedFilterNodeE.node = embarassedFilterNode
  addNode(embarassedFilterNodeE)
}

// 右侧抽屉
const leftDrawerVisible = ref(false)
// 资源总览弹窗
const staticResourcesVisible = ref(false)
// 数据卡展示
const dataCardVisible = ref(false)

provide('curSelectedNode', curSelectedNode)
</script>

<template>
  <div class="engineContainer" :key="viewKey">
    <div class="ds-ec-up" comment="上方">
      <div>
        <el-button @click="router.replace({ path: '/home' })">返回首页</el-button>
      </div>
      <div>x：{{ editorInfo.left }},y：{{ editorInfo.top }} 倍数：{{ editorInfo.scale }}</div>
      <div class="flex justify-between">
        <div>
          <el-button :disabled="nodeMap.has(1)" @click="addEditorNode(NodeEnum.Story)"
            >新增故事
          </el-button>
          <el-button @click="addEditorNode(NodeEnum.Scene)">新增场景</el-button>
          <el-button @click="addEditorNode(NodeEnum.Dialogue)">新增对话</el-button>
          <el-button @click="addEditorNode(NodeEnum.Caption)">新增字幕</el-button>
          <el-button @click="addEditorNode(NodeEnum.Option)">新增选项</el-button>
          <el-button :disabled="!nodeMap.has(1)" @click="generateNormalNode"
            >生成常用节点
          </el-button>
        </div>
        <div>
          <el-button @click="save">保存</el-button>
          <el-button @click="dataCardVisible = true">数据卡</el-button>
          <el-button @click="leftDrawerVisible = true">节点管理</el-button>
          <el-button @click="staticResourcesVisible = true">静态资源总览</el-button>
          <el-button @click="reset">重置数据</el-button>
          <el-button :disabled="!nodeMap.has(1)" @click="startGame">游戏预览</el-button>
        </div>
      </div>
    </div>

    <div
      class="ds-ec-left"
      comment="左侧"
      @mousedown="onMouseDown"
      @mouseleave="onMouseUp"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @wheel="onWheel"
    >
      <div :style="worktopStyle" class="stack absolute" comment="超大可拖动画布">
        <!-- 网格层 -->
        <div class="stackItem gridLayer"></div>
        <!-- 节点连线层 -->
        <div class="stackItem nodeLinkLayer">
          <svg style="width: 100%; height: 100%; pointer-events: none">
            <defs>
              <!-- 箭头定义 -->
              <marker
                id="arrow"
                markerHeight="10"
                markerUnits="strokeWidth"
                markerWidth="10"
                orient="auto"
                refX="5"
                refY="5"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill="#1890ff" fill-opacity="0.8" />
              </marker>
            </defs>

            <g v-for="(line, index) in nodeLinkList" :key="index">
              <!-- 计算中点坐标 -->
              <template
                v-if="true"
                :midX="(line.data[0][0] + line.data[1][0]) / 2"
                :midY="(line.data[0][1] + line.data[1][1]) / 2"
              />

              <!-- 第一段（带箭头） -->
              <line
                :x1="line.data[0][0]"
                :x2="(line.data[0][0] + line.data[1][0]) / 2"
                :y1="line.data[0][1]"
                :y2="(line.data[0][1] + line.data[1][1]) / 2"
                marker-end="url(#arrow)"
                shape-rendering="crispEdges"
                stroke="#1890ff"
                stroke-linecap="round"
                stroke-opacity="0.8"
                stroke-width="4"
              />

              <!-- 第二段（无箭头） -->
              <line
                :x1="(line.data[0][0] + line.data[1][0]) / 2"
                :x2="line.data[1][0]"
                :y1="(line.data[0][1] + line.data[1][1]) / 2"
                :y2="line.data[1][1]"
                shape-rendering="crispEdges"
                stroke="#1890ff"
                stroke-linecap="round"
                stroke-opacity="0.8"
                stroke-width="4"
              />

              <!-- ✅ 显示序号文字 -->
              <text
                :x="(line.data[0][0] + line.data[1][0]) / 2 - 30"
                :y="(line.data[0][1] + line.data[1][1]) / 2 - 30"
                dominant-baseline="middle"
                fill="#black"
                font-size="50"
                font-weight="bold"
                style="pointer-events: none; user-select: none"
                text-anchor="middle"
              >
                {{ line.sort }}
              </text>
            </g>
          </svg>
        </div>

        <!-- 节点层 -->
        <div class="stackItem nodeLayer">
          <div v-for="item in editorNodeList">
            {{ item }}
            <normal-rect-box
              v-if="item.boxType === EditorBoxEnum.NormalRect"
              :boxType="item.boxType"
              :layout="item.layout"
              :node="item.node"
              :scale="editorInfo.scale"
              fontSize="2rem"
              @click="curSelectedNode = item"
            ></normal-rect-box>
            <rounded-rect-box
              v-if="item.boxType === EditorBoxEnum.RoundedRect"
              :boxType="item.boxType"
              :layout="item.layout"
              :node="item.node"
              :scale="editorInfo.scale"
              fontSize="2rem"
              @click="curSelectedNode = item"
            ></rounded-rect-box>
          </div>
        </div>
      </div>
    </div>

    <div class="ds-ec-right hidden-scrollbar" comment="右侧">
      <right-tools></right-tools>
    </div>
  </div>
  <left-drawer v-model="leftDrawerVisible"></left-drawer>
  <static-resources-dialog v-model="staticResourcesVisible"></static-resources-dialog>
  <el-dialog v-model="dataCardVisible">
    <monaco-editor v-model="gameData"></monaco-editor>
  </el-dialog>
</template>

<style scoped>
.engineContainer {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-areas:
    'up up'
    'left right';
  grid-template-columns: 1fr 400px;
  grid-template-rows: 100px 1fr;
}

.ds-ec-up {
  grid-area: up;
  background: #f8f8f8;
  border-bottom: 1px solid #ddd;
}

.ds-ec-left {
  grid-area: left;
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
  border: 1px solid black;
  cursor: grab;
}

.ds-ec-left:active {
  cursor: grabbing;
}

.ds-ec-right {
  grid-area: right;
  background: #ffffff;
  border-left: 1px solid #ddd;
  overflow-y: auto;
}

/* 画布容器 */
.stack.absolute {
  position: absolute;
  will-change: transform;
}

/* 层叠系统 */
.stackItem {
  position: absolute;
  inset: 0;
}

/* === 网格层 === */
.gridLayer {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
}

/* === 节点层（未来可以放节点组件）=== */
.nodeLayer {
  pointer-events: none;
}
</style>
