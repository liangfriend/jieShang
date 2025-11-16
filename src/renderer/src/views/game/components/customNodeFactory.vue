<script lang="ts" setup>
import { PropType } from 'vue'
import { CustomNode, LayoutNode } from '@renderer/types'
import { NodeEnum } from '@renderer/enum'

const props = defineProps({
  layout: {
    type: Object as PropType<LayoutNode>,
    required: true
  },
  customNode: {
    type: Object as PropType<CustomNode>,
    required: true
  },
  canvasWidth: Number,
  canvasHeight: Number
})
</script>

<template>
  <template v-if="customNode.nodeType === NodeEnum.Custom"> </template>
</template>
