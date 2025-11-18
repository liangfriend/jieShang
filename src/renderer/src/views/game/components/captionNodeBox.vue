<script lang="ts" setup>
import { useCaption } from '@renderer/composables/useCaption'
import { computed, CSSProperties, defineProps, PropType, ref } from 'vue'
import { CaptionNode, CaptionStatus, ConditionNode, LayoutNode, OptionNode } from '@renderer/types'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { parseStyle, runCode } from '@renderer/utils/execJS'
import { CaptionBoxEnum } from '@renderer/enum'

const props = defineProps({
  layout: {
    type: Object as PropType<LayoutNode>,
    required: true
  },
  captionNode: {
    type: Object as PropType<CaptionNode>,
    required: true
  },
  canvasWidth: {
    // 画布宽
    type: Number,
    required: true
  },
  canvasHeight: {
    // 画布高
    type: Number,
    required: true
  }
})
const { editorNodeList, nodeMap, editorNodeMap, groupedNodes, clearNodeManager } = useNodeManager()
const emit = defineEmits<{
  (e: 'statusChange', status: CaptionStatus, captionNode: CaptionNode): void
}>()
const captionRef = ref<SVGAElement>(null!)
const {
  visible,
  x,
  y,
  width,
  height,
  captionTextStyle,
  displayText,
  layout,
  status,
  executingAction
} = useCaption(props, emit as (type: string, ...data: any) => void, captionRef)

const optionNodes = computed((): OptionNode[] => {
  const nodes: OptionNode[] = []
  props.captionNode?.optionIds.forEach((id) => {
    const optionNode = nodeMap.value.get(id) as OptionNode
    let visible = true
    for (let id of optionNode?.visibleConditionIds) {
      const conditionNode = nodeMap.value.get(id) as ConditionNode
      const res = runCode(conditionNode.func)

      if (!res) visible = false
    }
    if (optionNode && visible) {
      nodes.push(optionNode)
    }
  })
  return nodes
})
const optionContainerStyle = computed((): CSSProperties => {
  const width = 0.5
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: layout.width * width + 'px',
    top: 0 + 'px',
    height: layout.height + 'px',
    position: 'relative',
    left: layout.width * (1 - width) + 'px',
    overflow: 'hidden'
  }
})
const optionStyle = computed((): CSSProperties => {
  return {
    pointerEvents: 'auto',
    cursor: 'pointer',
    position: 'relative',
    width: '100%',
    height: layout.height / optionNodes.value.length + 'px'
  }
})
const hover = ref(false)
const hoverMap = ref(new Map<number, boolean>())
const customOptionStyle = computed((): ((node: OptionNode) => CSSProperties) => {
  return (node: OptionNode): CSSProperties => {
    try {
      const isHover = hoverMap.value.get(node.id) || false
      let style: CSSProperties = parseStyle(node.normalStyle)

      if (isHover) {
        style = { ...style, ...parseStyle(node.hoverStyle) }
      }
      return style
    } catch (e) {
      console.error('选项样式有误', node.nodeName, e)

      let style: CSSProperties = {
        backgroundColor: '#555',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        fontSize: '2rem',
        color: 'white',
        width: '100%',
        height: '50%',
        transform: 'translateY(50%)'
      }

      if (hoverMap.value.get(node.id)) {
        style = { ...style, backgroundColor: '#4096ff' }
      }

      return style
    }
  }
})
</script>

<template>
  <g
    v-if="visible"
    class="pointer-events-auto"
    ref="captionRef"
    :transform="`
        translate(${x}, ${y})
        scale(${layout.scale})
        rotate(${layout.rotation}, ${width / 2}, ${height / 2})
     `"
  >
    <!-- 背景框 -->
    <rect
      v-if="captionNode.boxType === CaptionBoxEnum.Origin"
      :height="height"
      :width="width"
      fill="rgba(0,0,0,0.6)"
      rx="12"
      stroke="white"
      stroke-width="2"
    />

    <!-- 文字 -->
    <foreignObject :height="height" :width="width">
      <div :style="captionTextStyle" class="caption-text">
        {{ displayText }}
      </div>
    </foreignObject>
    <!-- 按钮 -->
    <foreignObject :height="height" :width="width">
      <div v-if="status === 'finished' || status === 'done'" :style="optionContainerStyle">
        <div v-for="option in optionNodes" :style="optionStyle">
          <div
            :style="customOptionStyle(option)"
            @click="executingAction(option.activeActionIds)"
            @mouseenter="hoverMap.set(option.id, true)"
            @mouseleave="hoverMap.set(option.id, false)"
          >
            {{ option.text }}
          </div>
        </div>
      </div>
    </foreignObject>
  </g>
</template>

<style scoped>
.caption-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  padding: 16px;
  box-sizing: border-box;
  white-space: pre-wrap;
  font-family: 'Microsoft YaHei', sans-serif;
  user-select: none;
  pointer-events: none;
}
</style>
