import { computed, ComputedRef, Ref, ref, watch, watchEffect } from 'vue'
import { NodeEnum } from '@renderer/enum'
import { EditorNode, EngineNode, Prefab } from '@renderer/types'
import { Resolve } from 'element-plus'

export type NodeManager = {
  nodeMap: Ref<Map<number, EngineNode>>
  editorNodeMap: Ref<Map<number, EditorNode>>
  editorNodeList: Ref<EditorNode[]>
  groupedNodes: ComputedRef<Record<NodeEnum, EditorNode[]>>
  addNode: (node: EditorNode) => void
  removeNode: (id: string | number) => void
  addNodes: (nodes: EditorNode[]) => void
  clearNodeManager: () => void
  prefabList: Ref<Prefab[]>
  addPrefab: (prefab: Prefab) => void
  deletePrefab: (id: number) => void
  clearPrefab: () => void
}

export function setup(
  data: { editorNodeList: Array<EditorNode>; prefabList: Array<Prefab> },
  resolve: ((value: boolean) => void) | null = null
): NodeManager {
  const nodeMap = ref(new Map<number, EngineNode>())
  const editorNodeMap = ref(new Map<number, EditorNode>()) // 空间换时间
  const editorNodeList = ref<EditorNode[]>(data.editorNodeList ?? [])
  const prefabList = ref<Prefab[]>(data.prefabList ?? [])
  // 监听editorNodeList的变化, 不使用shallowRef,会导致拖拽元素坐标不更新
  watchEffect(() => {
    nodeMap.value.clear()
    editorNodeList.value?.forEach((item) => {
      const { id, nodeType } = item.node // 显式读取关键字段
      editorNodeMap.value.set(id, item)
      nodeMap.value.set(id, item.node)
    })
    if (resolve) {
      resolve(true)
    }
  })

  // 进行分组
  // 🔹 分组逻辑（根据 NodeEnum 的类型名分组）
  const groupedNodes = computed((): Record<NodeEnum, EditorNode[]> => {
    const groups: Record<NodeEnum, EditorNode[]> = {
      [NodeEnum.Story]: [],
      [NodeEnum.Scene]: [],
      [NodeEnum.Dialogue]: [],
      [NodeEnum.Caption]: [],
      [NodeEnum.Action]: [],
      [NodeEnum.Option]: [],
      [NodeEnum.Layout]: [],
      [NodeEnum.Curtain]: [],
      [NodeEnum.Image]: [],
      [NodeEnum.Video]: [],
      [NodeEnum.Audio]: [],
      [NodeEnum.Custom]: [],
      [NodeEnum.Filter]: [],
      [NodeEnum.Condition]: []
    }
    editorNodeList.value.forEach((item) => {
      const type = item.node.nodeType as NodeEnum
      if (groups[type]) {
        groups[type].push(item)
      }
    })
    return groups
  })
  // ✅ 添加节点
  const addNode = (node: EditorNode) => {
    editorNodeList.value.push(node)
    // 不需要手动 trigger，watchEffect 会自动响应数组内容变化
  }

  // ✅ 删除节点（通过 node.id）
  const removeNode = (id: string | number) => {
    const index = editorNodeList.value.findIndex((item) => item.node.id === id)
    if (index !== -1) {
      editorNodeList.value.splice(index, 1) // 使用 splice 确保响应式更新
    }
  }

  // ✅ 批量添加节点（可选增强）
  const addNodes = (nodes: EditorNode[]) => {
    editorNodeList.value.push(...nodes)
  }

  // 重置数据
  const clearNodeManager = () => {
    editorNodeList.value = []
  }

  const addPrefab = (prefab: Prefab) => {
    prefabList.value.push(prefab)
  }

  const deletePrefab = (id: number) => {
    const index = prefabList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      prefabList.value.splice(index, 1)
    }
  }

  // 重置数据
  const clearPrefab = () => {
    prefabList.value = []
  }

  return {
    nodeMap,
    editorNodeMap,
    editorNodeList,
    groupedNodes, // 这个是计算属性，不要编辑这个
    addNode,
    removeNode,
    addNodes,
    clearNodeManager,
    prefabList,
    addPrefab,
    deletePrefab,
    clearPrefab
  }
}

// 用于编辑器
let res: NodeManager | null = null

// 废弃localStorage， 每次进入测试游戏界面和编辑器界面和游戏界面都调用这个从数据库拿值
export async function updateLoadedEditorNodeList(
  editorNodeList: Array<EditorNode>,
  prefabList: Array<Prefab>
) {
  return new Promise((resolve) => {
    if (!res) {
      res = setup({ editorNodeList, prefabList }, resolve)
    } else {
      // 重新进入的时候，要再初始化watchEffect, effectScope试了不管用
      watchEffect(() => {
        res!.nodeMap.value.clear()
        res!.editorNodeList.value?.forEach((item) => {
          const { id, nodeType } = item.node // 显式读取关键字段
          res!.editorNodeMap.value.set(id, item)
          res!.nodeMap.value.set(id, item.node)
        })
        resolve(true)
      })
      res.editorNodeList.value = editorNodeList
      res.prefabList.value = prefabList
    }
  })
}

// 为了保证游戏数据和编辑器数据隔离，初始化两次
export function useNodeManager(): NodeManager {
  if (!res) {
    // 这里不让它异步，这里只是返回一些空数据保证不报错
    res = setup({ editorNodeList: [], prefabList: [] })
  }
  return res!
}
