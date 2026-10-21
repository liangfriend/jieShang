<script lang="ts" setup>
import { computed } from 'vue'
import { customSymbolMarkup } from '@renderer/utils/customSymbolSvg'

const props = withDefaults(
  defineProps<{
    content: string
    w: number
    h: number
    /** 预览框边长（px），字形等比缩放居中；不传时按 w × h 原尺寸 */
    size?: number
  }>(),
  { size: undefined }
)

const markup = computed(() =>
  props.content && props.w > 0 && props.h > 0 ? customSymbolMarkup(props.content, props.w, props.h) : ''
)
</script>

<template>
  <svg
    v-if="markup"
    class="custom-symbol-glyph"
    :width="size ?? w"
    :height="size ?? h"
    :viewBox="`0 0 ${w} ${h}`"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g v-html="markup" />
  </svg>
</template>

<style scoped>
.custom-symbol-glyph {
  display: block;
  overflow: visible;
  pointer-events: none;
}
</style>
