<script lang="ts" setup>
import { PropType } from 'vue'
import { EditorNode } from '@renderer/types'
import { EditorBoxEnum } from '@renderer/enum'
import { nodeNameMap } from '@renderer/constant'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  data: {
    type: Object as PropType<EditorNode>,
    required: true
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

function deleteNode() {
  ElMessageBox.confirm('确认删除', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(() => {
      removeNode(props.data?.node.id)
    })
    .catch(() => {})
}
</script>

<template>
  <div
    v-if="data"
    class="node-card h-80 w-56 border relative border-gray-400 rounded-2xl p-4 cursor-pointer bg-white/80 transition-all duration-300 ease-in-out"
  >
    <div
      class="absolute right-2 top-2 h-2 center w-12 rounded-2xl outline-1 hover:bg-[red] duration-200"
      @click.stop="deleteNode"
    ></div>
    <div class="font-bold mb-2">{{ data.node.nodeName }}</div>
    <div>节点类型：{{ nodeNameMap[data.node.nodeType] }}</div>
    <div v-if="data.boxType !== EditorBoxEnum.None">
      <div class="font-bold mt-2">布局信息：</div>
      <div>横坐标：{{ data.layout.left }}</div>
      <div>纵坐标：{{ data.layout.top }}</div>
      <div>宽度：{{ data.layout.width }}</div>
      <div>高度：{{ data.layout.height }}</div>
    </div>
  </div>
</template>

<style scoped>
.node-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background-color: rgba(255, 255, 255, 0.95);
  border-color: #3b82f6; /* Tailwind 的蓝色500 */
}
</style>
