<script lang="ts" setup>
import { computed, CSSProperties, onMounted, provide, ref, watch } from 'vue'
import {
  ActionNode,
  CaptionNode,
  DialogueNode,
  EditorNode,
  EngineNode,
  OptionNode,
  Prefab,
  SceneNode,
  StoryNode
} from '@renderer/types'
import {
  ActionTypeEnum,
  EditorBoxEnum,
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import RoundedRectBox from './components/roundedRectBox.vue'
import MonacoEditor from '@renderer/components/monacoEditor.vue'
import { updateLoadedGameData, useGameData } from '@renderer/composables/useGameData'
import { updateStaticResource } from '@renderer/composables/useStaticResource'
import PublishDialog from '@renderer/views/editor/components/publishDialog.vue'
import updateGameDialog from '@renderer/views/editor/components/updateGmaeDialog.vue'
import { generateNormalNode } from '@renderer/utils/usefulNode'
import ContextMenu from '@renderer/components/contextMenu.vue'
import { getNumericUUID } from '@renderer/utils/crypto'

const router = useRouter()
const route = useRoute()
// =====================================数据初始化==================================
const { editorInfo, resetEditorInfo } = useEditor()
const { gameData } = useGameData()
const {
  editorNodeList,
  nodeMap,
  editorNodeMap,
  addNode,
  groupedNodes,
  clearNodeManager,
  prefabList,
  addPrefab: registerPrefab
} = useNodeManager()

const workId = computed(() => {
  return route.query.workId
})
onMounted(async () => {
  const work = (await window.api.work.query({ id: workId.value })).data[0]
  const data = JSON.parse(work.data)
  if (data) {
    await updateLoadedEditorNodeList(data.editorNodeList, data.prefabList)
    updateLoadedGameData(data.gameData)
    updateLoadedEditorInfo(data.editorInfo)
  }
  const resourceList = (await window.api.resource.list()).data
  updateStaticResource(resourceList)
})
// =====================================拖拽/移动/右键菜单功能================================
const isPanning = ref(false)
const isFrameSelecting = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

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
// ===================================== 右键菜单 ==================================
const showMenu = ref(false)
// 菜单坐标
const menuPos = ref({ x: 0, y: 0 })
// 菜单起始位置相对网格的坐标
const menuGridPos = ref({ x: 0, y: 0 })
function onRightClick(e: MouseEvent) {
  e.preventDefault()
  menuPos.value = { x: e.clientX, y: e.clientY }
  showMenu.value = true
  // 保存菜单相对网格的坐标
  const scale = editorInfo.value.scale
  const containerRect = document.querySelector('.ds-ec-left')?.getBoundingClientRect()!
  menuGridPos.value.x = -editorInfo.value.left + (e.clientX - containerRect.left) / scale
  menuGridPos.value.y = -editorInfo.value.top + (e.clientY - containerRect.top) / scale
}
function closeMenu() {
  showMenu.value = false
}

const contextMenuType = ref('grid') // 右键菜单类型  grid node frame  网格 节点 框选框
/*
 * 预制体类型
 * 预制体中每个节点的坐标会变为相对预制体节点列表中最靠左上角节点的坐标点相对坐标。除此之外和普通节点没区别
 * */
// 临时预制体
const tempPrefab = ref<Prefab>({ id: -1, name: '临时', editorNodeList: [] })
const selectedPrefabId = ref<number | null>(null)
const selectedPrefab = computed(() => {
  if (!prefabList.value.length || selectedPrefabId.value == null) return null
  return prefabList.value.find((item) => item.id === selectedPrefabId.value) ?? null
})

watch(
  prefabList,
  (list) => {
    if (!list.length) {
      selectedPrefabId.value = null
      return
    }
    if (!list.find((prefab) => prefab.id === selectedPrefabId.value)) {
      selectedPrefabId.value = list[0].id
    }
  },
  { deep: true }
)
// 更新右键菜单类型
function changeMenuType(type) {
  contextMenuType.value = type
}
// 复制
function copyTempPrefab() {
  const selectedNodes = Array.from(dragSelectedNodes.value)
  if (selectedNodes.some((e) => e.node.nodeType === NodeEnum.Story)) {
    ElMessage.error('不可以复制故事节点')
    return
  }
  // 深拷贝 dragSelectedNodes
  const copy = JSON.parse(JSON.stringify(selectedNodes)) as EditorNode[]

  if (copy.length === 0) return

  // 找出最小 left / top
  let minLeft = Infinity
  let minTop = Infinity

  let uniqueId = 1
  for (const n of copy) {
    if (n.layout.left < minLeft) minLeft = n.layout.left
    if (n.layout.top < minTop) minTop = n.layout.top
  }

  // 将所有节点位置转换为相对坐标
  copy.forEach((n) => {
    n.layout.left = n.layout.left - minLeft
    n.layout.top = n.layout.top - minTop
  })

  tempPrefab.value.editorNodeList = copy
  closeMenu()
}

function getCanvasCenter() {
  const scale = editorInfo.value.scale
  const containerRect = document.querySelector('.ds-ec-left')?.getBoundingClientRect()
  if (!containerRect) return { x: 0, y: 0 }
  const containerWidth = containerRect.width / scale
  const containerHeight = containerRect.height / scale
  return {
    x: -editorInfo.value.left + containerWidth / 2,
    y: -editorInfo.value.top + containerHeight / 2
  }
}

function getPrefabBoundingBox(prefab: Prefab) {
  let width = 0
  let height = 0
  prefab.editorNodeList.forEach((node) => {
    width = Math.max(width, node.layout.left + node.layout.width)
    height = Math.max(height, node.layout.top + node.layout.height)
  })
  return { width, height }
}

function handleAddPrefabToCenter() {
  if (!selectedPrefab.value) return
  const { width, height } = getPrefabBoundingBox(selectedPrefab.value)
  const { x, y } = getCanvasCenter()
  const left = x - width / 2
  const top = y - height / 2
  spawnPrefab(selectedPrefab.value, left, top)
}

async function handleSavePrefab() {
  if (dragSelectedNodes.value.size === 0) {
    ElMessage.warning('请选择要保存为预制体的节点')
    return
  }
  if (Array.from(dragSelectedNodes.value).some((node) => node.node.nodeType === NodeEnum.Story)) {
    ElMessage.error('预制体中不能包含故事节点')
    return
  }
  try {
    const { value } = await ElMessageBox.prompt('请输入预制体名称', '保存预制体', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入预制体名称'
    })
    saveAsPrefab(value.trim())
    ElMessage.success('预制体已保存')
  } catch (error) {
    // 用户取消
  }
}

// 添加预制体
function spawnPrefab(prefab: Prefab, left: number, top: number) {
  //
  const newCopy = JSON.parse(JSON.stringify(prefab.editorNodeList)) as EditorNode[]
  // 对newCopy的id进行收集,然后对此id进行映射
  const idMap = new Map()
  for (const n of newCopy) {
    // 更新坐标
    n.layout.left = n.layout.left + left
    n.layout.top = n.layout.top + top
    // 存储id
    if (!idMap.has(n.node.id)) {
      idMap.set(n.node.id, getNumericUUID())
    }
  }
  const mapId = (id: number) => (idMap.has(id) ? idMap.get(id) : id)
  const mapIds = (ids: number[]) => ids.map(mapId)

  for (const n of newCopy) {
    // 更新id
    n.node.id = idMap.get(n.node.id)
    const type = n.node.nodeType
    // 对预制体内引用的id进行更新
    if (type === NodeEnum.Story) {
      if (idMap.has(n.node.entrySceneId)) {
        n.node.entrySceneId = idMap.get(n.node.entrySceneId)
      }
    } else if (type === NodeEnum.Scene) {
      const node = n.node as SceneNode
      node.initDialogueIds = mapIds(node.initDialogueIds)
      node.initActionIds = mapIds(node.initActionIds)
      node.initImageIds = mapIds(node.initImageIds)
      node.initCustomIds = mapIds(node.initCustomIds)
      node.initAudioIds = mapIds(node.initAudioIds)
      node.initVideoIds = mapIds(node.initVideoIds)
      if (idMap.has(node.endCurationId)) {
        node.endCurationId = idMap.get(node.endCurationId)
      }
    } else if (type === NodeEnum.Dialogue) {
      const node = n.node as DialogueNode
      node.keepIds = mapIds(node.keepIds)
      node.initImageIds = mapIds(node.initImageIds)
      node.initCustomIds = mapIds(node.initCustomIds)
      node.initAudioIds = mapIds(node.initAudioIds)
      node.initVideoIds = mapIds(node.initVideoIds)
      node.initCaptionIds = mapIds(node.initCaptionIds)
      node.initActionIds = mapIds(node.initActionIds)
    } else if (type === NodeEnum.Caption) {
      const node = n.node as CaptionNode
      node.layoutId = mapId(node.layoutId)
      node.initActionIds = mapIds(node.initActionIds)
      node.finishActionIds = mapIds(node.finishActionIds)
      node.doneActionIds = mapIds(node.doneActionIds)
      node.optionIds = mapIds(node.optionIds)
    } else if (type === NodeEnum.Option) {
      const node = n.node as OptionNode
      node.activeActionIds = mapIds(node.activeActionIds)
      node.visibleConditionIds = mapIds(node.visibleConditionIds)
    }
    addNode(n)
  }
  closeMenu()
}
// 删除
function deleteTempPrefab() {
  tempPrefab.value.editorNodeList = []
}
// 保存为预制体
function saveAsPrefab(name: string) {
  if (!name) return
  // 深拷贝 dragSelectedNodes
  const copy = JSON.parse(JSON.stringify([...dragSelectedNodes.value])) as EditorNode[]

  if (copy.length === 0) return

  // 找出最小 left / top
  let minLeft = Infinity
  let minTop = Infinity

  let uniqueId = 1
  for (const n of copy) {
    if (n.layout.left < minLeft) minLeft = n.layout.left
    if (n.layout.top < minTop) minTop = n.layout.top
  }

  // 将所有节点位置转换为相对坐标
  copy.forEach((n) => {
    n.layout.left = n.layout.left - minLeft
    n.layout.top = n.layout.top - minTop
  })

  const newPrefab = {
    id: getNumericUUID(),
    name: name,
    editorNodeList: copy
  }
  registerPrefab(newPrefab)
  selectedPrefabId.value = newPrefab.id
}
// ============================ 样式===============================
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

// ===================节点功能==========================

// 当前选中节点, 这个主要是用于展示右侧菜单，真正的标红高亮节点列表应该是dragSelectedNodes
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

// 添加节点
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
    node.boxType = EditorBoxEnum.NormalRect
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

// 重置数据
function reset() {
  resetEditorInfo()
  clearNodeManager()
  ElMessage.success('重置成功')
}

// 保存编辑器和节点信息
async function save() {
  // 更新数据
  const data = {
    editorInfo: editorInfo.value,
    editorNodeList: editorNodeList.value,
    gameData: gameData.value,
    prefabList: prefabList.value
  }
  await window.api.work.update(workId.value, { data: JSON.stringify(data) })
  ElMessage.success('保存成功')
}

const storyNode = computed((): StoryNode => {
  return groupedNodes.value?.[NodeEnum.Story]?.[0]?.node as StoryNode
})

// 游戏预览
function startGame() {
  const route = `/game/entry?type=test&gameId=${workId.value}`
  // window.open(url, '_blank')
  console.log('chicken', route, window.location.href)
  window.api.window.open('game', route, {
    width: storyNode.value.width,
    height: storyNode.value.height
  })
}

// 右侧抽屉
const leftDrawerVisible = ref(false)
// 资源总览弹窗
const staticResourcesVisible = ref(false)
// 数据卡展示
const dataCardVisible = ref(false)
// 发布游戏弹窗
const publishDialogVisible = ref(false)
// 更新到游戏弹窗
const updateGameVisible = ref(false)
provide('curSelectedNode', curSelectedNode)
</script>

<template>
  <div class="engineContainer">
    <div class="ds-ec-up" comment="上方">
      <div class="flex justify-between">
        <div>
          <div>
            <el-button @click="router.replace({ path: '/home' })">返回首页</el-button>
            x：{{ editorInfo.left.toFixed(2) }},y：{{ editorInfo.top.toFixed(2) }} 倍数：{{
              editorInfo.scale.toFixed(2)
            }}
          </div>
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
          <div class="flex items-center gap-2 mt-2">
            <el-select
              v-model="selectedPrefabId"
              class="prefab-select"
              placeholder="选择预制体"
              style="width: 220px"
            >
              <el-option
                v-for="prefab in prefabList"
                :key="prefab.id"
                :label="prefab.name"
                :value="prefab.id"
              />
            </el-select>
            <el-button :disabled="!selectedPrefab" @click="handleAddPrefabToCenter"
              >添加预制体
            </el-button>
            <el-button :disabled="dragSelectedNodes.size === 0" @click="handleSavePrefab"
              >保存为预制体
            </el-button>
          </div>
        </div>
        <div>
          <el-button @click="save">保存</el-button>
          <el-button @click="dataCardVisible = true">数据卡</el-button>
          <el-button @click="leftDrawerVisible = true">节点管理</el-button>
          <el-button @click="staticResourcesVisible = true">静态资源总览</el-button>
          <el-button @click="reset">重置数据</el-button>
          <el-button :disabled="!nodeMap.has(1)" @click="startGame">游戏预览</el-button>
          <el-button @click="publishDialogVisible = true">发布</el-button>
          <el-button @click="updateGameVisible = true">更新数据到游戏</el-button>
        </div>
      </div>
    </div>

    <div
      class="ds-ec-left"
      comment="左侧"
      @mousedown="
        (e) => {
          onMouseDown(e)
          changeMenuType('grid')
        }
      "
      @mouseleave="onMouseUp"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @wheel="onWheel"
      @contextmenu="onRightClick($event)"
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
              @mousedown="
                (e) => {
                  handleRectBoxClick(item)
                  closeMenu()
                }
              "
              @contextmenu="changeMenuType('node')"
            ></normal-rect-box>
          </div>
          <!--    框选框     -->
          <div :style="frameSelectedNodeStyle" v-show="dragRectLayout.show"></div>
          <!--    拖拽框     -->
          <div :style="dragRectStyle" v-show="dragSelectedNodes.size > 1"></div>
          <!--    拖拽按钮     -->
          <div
            @mousedown.stop="
              (e) => {
                batchMouseDown(e)
                closeMenu()
              }
            "
            :style="dragRectBtnStyle"
            v-show="dragSelectedNodes.size > 1"
            @mousedown="changeMenuType('frame')"
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
    v-model="publishDialogVisible"
  ></publish-dialog>
  <update-game-dialog
    :editor-info="editorInfo"
    :game-data="gameData"
    :editor-node-list="editorNodeList"
    v-model="updateGameVisible"
  >
  </update-game-dialog>
  <context-menu :x="menuPos.x" :y="menuPos.y" :show="showMenu" @close="closeMenu">
    <div class="menu-item" @click="copyTempPrefab">复制</div>
    <div class="menu-item" @click="spawnPrefab(tempPrefab, menuGridPos.x, menuGridPos.y)">粘贴</div>
    <div class="menu-item" @click="deleteTempPrefab">删除</div>
    <div class="menu-item" @click="handleSavePrefab">保存为预制体</div>
  </context-menu>
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
/*右键菜单样式*/
.menu-item {
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.menu-item:hover {
  background: #f0f0f0;
}
</style>
