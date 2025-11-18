<script lang="ts" setup>
// 资源管理，所有节点类型  选项节点  图片节点  音频节点  视频节点

import { computed, ref } from 'vue'
import { EditorNode } from '@renderer/types'
import { EditorBoxEnum, NodeEnum } from '@renderer/enum'
import NodeCard from './nodeCard.vue'
import NodeInfoDialog from './nodeInfoDialog.vue'
import { editorNodeTemplate } from '@renderer/utils/nodeTemplate'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { useEditor } from '@renderer/composables/useEditor'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const {
  editorNodeList,
  nodeMap,
  editorNodeMap,
  addNode,
  removeNode,
  groupedNodes,
  clearNodeManager
} = useNodeManager()

const emit = defineEmits(['update:modelValue'])
// 顶部筛选列表
const tabList = ref([
  {
    label: '全部',
    value: 'all'
  },
  {
    label: '故事',
    value: NodeEnum.Story
  },
  {
    label: '场景',
    value: NodeEnum.Scene
  },
  {
    label: '对话',
    value: NodeEnum.Dialogue
  },
  {
    label: '字幕',
    value: NodeEnum.Caption
  },
  {
    label: '选项',
    value: NodeEnum.Option
  },
  {
    label: '行为',
    value: NodeEnum.Action
  },
  {
    label: '布局',
    value: NodeEnum.Layout
  },
  {
    label: '幕布',
    value: NodeEnum.Curtain
  },
  {
    label: '图片',
    value: NodeEnum.Image
  },
  {
    label: '音频',
    value: NodeEnum.Audio
  },
  {
    label: '视频',
    value: NodeEnum.Video
  },
  {
    label: '滤镜',
    value: NodeEnum.Filter
  },
  {
    label: '自定义',
    value: NodeEnum.Custom
  },
  {
    label: '条件',
    value: NodeEnum.Condition
  },
  {
    label: '数据',
    value: NodeEnum.Data
  }
])
// 选中的标签
const activeTab = ref('all')
// 筛选后的列表
const editorNodeListFilted = computed(() => {
  if (activeTab.value === 'all') return editorNodeList.value
  return editorNodeList.value.filter((e) => {
    return e.node.nodeType === activeTab.value
  })
})

function changeTab(item: { value: string; label: string }) {
  activeTab.value = item.value
  if (item.value !== 'all') {
    addTarget.value = item.value as NodeEnum
  }
}

// 节点卡片点击事件
const selectedNodeId = ref(-1)

function handleClickCard(item: EditorNode) {
  selectedNodeId.value = item.node.id
  infoDialogVisible.value = true
}

// 下拉框添加功能
const addTarget = ref(NodeEnum.Story)

// 节点详情弹窗功能
const infoDialogVisible = ref(false)
const { editorInfo, resetEditorInfo } = useEditor()

// 添加新节点
function addNewNode() {
  const node = editorNodeTemplate(addTarget.value)
  const scale = editorInfo.value.scale

  // 容器视口宽高
  const containerRect = document.querySelector('.ds-ec-left')?.getBoundingClientRect()!
  const containerWidth = containerRect?.width / scale // 转换为缩放后
  const containerHeight = containerRect?.height / scale // 转换为缩放后

  if ([NodeEnum.Story, NodeEnum.Scene, NodeEnum.Dialogue].includes(addTarget.value)) {
    node.layout.width = 400 // 宽高传入后已经展示为缩放后的效果，所以不用除scale
    node.layout.height = 200
    node.boxType = EditorBoxEnum.NormalRect
    node.layout.left = -editorInfo.value.left + containerWidth / 2 - node.layout.width / 2
    node.layout.top = -editorInfo.value.top + containerHeight / 2 - node.layout.height / 2
  } else if ([NodeEnum.Caption].includes(addTarget.value)) {
    node.layout.width = 400 // 宽高传入后已经展示为缩放后的效果，所以不用除scale
    node.layout.height = 100
    node.boxType = EditorBoxEnum.NormalRect
    node.layout.left = -editorInfo.value.left + containerWidth / 2 - node.layout.width / 2
    node.layout.top = -editorInfo.value.top + containerHeight / 2 - node.layout.height / 2
  } else if ([NodeEnum.Option].includes(addTarget.value)) {
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
</script>

<template>
  <el-drawer
    v-model="props.modelValue"
    :with-header="false"
    direction="ltr"
    size="90%"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <div class="flex justify-between">
      <div class="flex gap-2">
        <el-tag
          v-for="item in tabList"
          :type="activeTab === item.value ? 'warning' : 'info'"
          class="cursor-pointer"
          @click="changeTab(item)"
        >
          {{ item.label }}
        </el-tag>
      </div>
      <div class="w-64 flex justify-between">
        <el-select v-model="addTarget" :style="{ width: '8rem' }" class="shrink-0">
          <el-option
            v-for="item in tabList.filter((e) => e.value !== 'all')"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-button class="w-24 shrink-0" @click="addNewNode">添加节点</el-button>
      </div>
    </div>

    <div class="ds-src-scroll-container flex flex-wrap gap-4">
      <node-card
        v-for="item in editorNodeListFilted"
        :data="item"
        class="flex-shrink-0"
        @click="handleClickCard(item)"
      ></node-card>
    </div>
  </el-drawer>
  <node-info-dialog v-model="infoDialogVisible" :node-id="selectedNodeId"></node-info-dialog>
</template>

<style scoped></style>
