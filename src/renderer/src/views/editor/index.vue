<script lang="ts" setup>
import { computed, CSSProperties, onBeforeMount, onMounted, provide, ref } from 'vue'
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
import PublishDialog from '@renderer/views/editor/components/publishDialog.vue'
// 设置窗口类型
sessionStorage.setItem('editorNodeListType', 'editor')
// 编辑器功能
const { editorInfo, resetEditorInfo } = useEditor()
const { gameData } = useGameData()
// 是否启动网格层移动
const isPanning = ref(false)
const isFrameSelecting = ref(false)
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
  const scale = editorInfo.value.scale
  // 框选
  if (e.button === 0) {
    dragSelectedNodes.value.clear()
    isFrameSelecting.value = true
    // 容器视口宽高
    const containerRect = document.querySelector('.ds-ec-left')?.getBoundingClientRect()!
    dragRectLayout.value.show = true
    // 需要减去容器相对视口的left,top
    dragRectLayout.value.left = (e.clientX - containerRect.left) / scale + -editorInfo.value.left
    dragRectLayout.value.top = (e.clientY - containerRect.top) / scale + -editorInfo.value.top
    dragRectLayout.value.width = 0
    dragRectLayout.value.height = 0
    dragRectLayout.value.startX = e.clientX
    dragRectLayout.value.startY = e.clientY
  }
  if (e.button === 1) {
    isPanning.value = true
    lastMouse.value = { x: e.clientX, y: e.clientY }
  }
}

function onMouseMove(e: MouseEvent) {
  const scale = editorInfo.value.scale
  // 框选
  if (isFrameSelecting.value) {
    dragRectLayout.value.width = (e.clientX - dragRectLayout.value.startX) / scale
    dragRectLayout.value.height = (e.clientY - dragRectLayout.value.startY) / scale
    // 在范围内的节点添加到选中列表
    editorNodeMap.value.forEach((node) => {
      if (
        dragRectLayout.value.left < node.layout.left &&
        dragRectLayout.value.top < node.layout.top &&
        dragRectLayout.value.left + dragRectLayout.value.width >
          node.layout.left + node.layout.width &&
        dragRectLayout.value.top + dragRectLayout.value.height >
          node.layout.top + node.layout.height
      ) {
        dragSelectedNodes.value.add(node)
      } else {
        if (dragSelectedNodes.value.has(node)) {
          dragSelectedNodes.value.delete(node)
        }
      }
    })
  }

  // 网格层移动
  if (isPanning.value) {
    const dx = (e.clientX - lastMouse.value.x) / scale
    const dy = (e.clientY - lastMouse.value.y) / scale
    editorInfo.value.left += dx
    editorInfo.value.top += dy
    lastMouse.value = { x: e.clientX, y: e.clientY }
  }
}

function onMouseUp() {
  isFrameSelecting.value = false
  isPanning.value = false
  dragRectLayout.value.show = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.min(3, Math.max(0.2, editorInfo.value.scale + delta))
  editorInfo.value.scale = newScale
}

// 左键拖拽框
const dragRectLayout = ref({
  show: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  startX: 0,
  startY: 0
})
// 拖拽框选中节点列表
const dragSelectedNodes = ref<Set<EditorNode>>(new Set())

function handleRectBoxClick(item: EditorNode) {
  curSelectedNode.value = item
  dragSelectedNodes.value.clear()
  dragSelectedNodes.value.add(item)
}

const frameSelectedNodeStyle = computed((): CSSProperties => {
  const res: CSSProperties = {
    position: 'absolute',
    left: dragRectLayout.value.left + 'px',
    top: dragRectLayout.value.top + 'px',
    width: dragRectLayout.value.width + 'px',
    height: dragRectLayout.value.height + 'px',
    outline: '5px dashed red',
    pointerEvents: 'none'
  }
  return res
})
const dragRectStyle = computed((): CSSProperties => {
  let left = Infinity,
    top = Infinity,
    width = -Infinity,
    height = -Infinity
  let MaxLeft = -Infinity
  let MaxTop = -Infinity
  dragSelectedNodes.value.forEach((node) => {
    left = Math.min(left, node.layout.left)
    top = Math.min(top, node.layout.top)
    MaxLeft = Math.max(MaxLeft, node.layout.left + node.layout.width)
    MaxTop = Math.max(MaxTop, node.layout.top + node.layout.height)
    width = MaxLeft - left
    height = MaxTop - top
  })
  const res: CSSProperties = {
    position: 'absolute',
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px',
    outline: '5px solid #555',
    pointerEvents: 'none'
  }
  return res
})
const dragRectBtnStyle = computed((): CSSProperties => {
  let left = Infinity,
    top = Infinity,
    width = -Infinity,
    height = -Infinity
  let MaxLeft = -Infinity
  let MaxTop = -Infinity
  dragSelectedNodes.value.forEach((node) => {
    left = Math.min(left, node.layout.left)
    top = Math.min(top, node.layout.top)
    MaxLeft = Math.max(MaxLeft, node.layout.left + node.layout.width)
    MaxTop = Math.max(MaxTop, node.layout.top + node.layout.height)
    width = MaxLeft - left
    height = MaxTop - top
  })
  const size = 50
  const res: CSSProperties = {
    position: 'absolute',
    left: left - size / 2 + 'px',
    top: top - size / 2 + 'px',
    width: size + 'px',
    height: size + 'px',
    outline: '5px solid #555',
    backgroundColor: 'white',
    cursor: 'pointer'
  }
  return res
})

// 批量拖拽
const isBatchDragging = ref(false)
const batchStartPos = ref({ x: 0, y: 0 })

function batchMouseDown(e: MouseEvent) {
  isBatchDragging.value = true
  batchStartPos.value = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', batchMouseMove)
  document.addEventListener('mouseup', batchMouseUp)
}

function batchMouseMove(e: MouseEvent) {
  if (!isBatchDragging.value) return
  const scale = editorInfo.value.scale
  const dx = (e.clientX - batchStartPos.value.x) / (scale ?? 1)
  const dy = (e.clientY - batchStartPos.value.y) / (scale ?? 1)
  batchStartPos.value = { x: e.clientX, y: e.clientY }
  dragSelectedNodes.value.forEach((node) => {
    node.layout.left += dx
    node.layout.top += dy
  })
}

function batchMouseUp(e: MouseEvent) {
  isBatchDragging.value = false
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
onMounted(async () => {
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
    }
  }
})

// 游戏预览
function startGame() {
  const route = `/game/entry?type=test&gameId=${workId.value}&sceneId=-1`
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
// 发布游戏弹窗
const publishDialogvisible = ref(false)
provide('curSelectedNode', curSelectedNode)
</script>

<template>
  <div class="engineContainer">
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
          <el-button @click="publishDialogvisible = true">发布</el-button>
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
        <div class="stack-item gridLayer"></div>
        <!-- 节点连线层 -->
        <div class="stack-item nodeLinkLayer">
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
        <div class="stack-item nodeLayer">
          <div v-for="item in editorNodeList">
            <normal-rect-box
              v-if="item.boxType === EditorBoxEnum.NormalRect"
              :boxType="item.boxType"
              :layout="item.layout"
              :selected="dragSelectedNodes.has(item)"
              :node="item.node"
              :scale="editorInfo.scale"
              fontSize="2rem"
              @mousedown="dragSelectedNodes.clear()"
              @click="handleRectBoxClick(item)"
            ></normal-rect-box>
            <rounded-rect-box
              v-if="item.boxType === EditorBoxEnum.RoundedRect"
              :boxType="item.boxType"
              :layout="item.layout"
              :selected="dragSelectedNodes.has(item)"
              :node="item.node"
              :scale="editorInfo.scale"
              fontSize="2rem"
              @mousedown="dragSelectedNodes.clear()"
              @click="handleRectBoxClick(item)"
            ></rounded-rect-box>
          </div>
          <!--    框选框     -->
          <div :style="frameSelectedNodeStyle" v-show="dragRectLayout.show"></div>
          <!--    拖拽框     -->
          <div :style="dragRectStyle" v-show="dragSelectedNodes.size > 1"></div>
          <!--    拖拽按钮     -->
          <div
            @mousedown.stop="batchMouseDown"
            :style="dragRectBtnStyle"
            v-show="dragSelectedNodes.size > 1"
          ></div>
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
  <publish-dialog
    :editor-info="editorInfo"
    :game-data="gameData"
    :editor-node-list="editorNodeList"
    v-model="publishDialogvisible"
  ></publish-dialog>
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
.stack-item {
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
