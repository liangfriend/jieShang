<script lang="ts" setup>
import { computed, CSSProperties, ref } from 'vue'
import { EditorBoxEnum } from '@renderer/enum'
import type { EngineNode } from '@renderer/types'

interface Props {
  layout: {
    top: number
    left: number
    width: number
    height: number
  }
  selected: boolean
  scale: number
  boxType: EditorBoxEnum
  node: EngineNode
  fontSize: string
}

const props = defineProps<Props>()

// 根据 layout 生成样式
const boxStyle = computed(
  (): CSSProperties => ({
    position: 'absolute',
    width: `${props.layout.width}px`,
    height: `${props.layout.height}px`,
    left: '0',
    top: '0',
    transform: `translate(${props.layout.left}px, ${props.layout.top}px)`,
    border: '2px solid ' + (props.selected ? 'red' : '#409eff'),
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.9)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto', // 开启交互
    cursor: 'pointer',
    fontSize: props.fontSize
  })
)

// 拖拽功能
const emit = defineEmits<{
  (e: 'update:layout', layout: { left: number; top: number }): void
}>()

const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })

function onMouseDown(e: MouseEvent) {
  e.stopPropagation() // 避免触发父画布的拖动
  isDragging.value = true
  startPos.value = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const dx = (e.clientX - startPos.value.x) / (props.scale ?? 1)
  const dy = (e.clientY - startPos.value.y) / (props.scale ?? 1)
  props.layout.left += dx
  props.layout.top += dy
  startPos.value = { x: e.clientX, y: e.clientY }
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div :style="boxStyle" class="editor-node-box" @mousedown="onMouseDown">
    <div class="title">
      {{ node.nodeName }}
    </div>
  </div>
</template>

<style scoped>
.editor-node-box {
  font-size: 16px;
  color: #333;
  user-select: none;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
}

.editor-node-box:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.title {
  font-weight: 600;
  text-align: center;
}
</style>
