<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { FilterNode } from '@renderer/types'
import { FilterTypeEnum } from '@renderer/enum'

const props = defineProps({
  filterNode: {
    type: Object as PropType<FilterNode>,
    required: true
  },
  canvasWidth: { type: Number, required: true },
  canvasHeight: { type: Number, required: true }
})

// 计算滤镜样式
const filterStyle = computed(() => {
  const type = props.filterNode.filterType

  switch (type) {
    case FilterTypeEnum.Normal:
      return ''

    case FilterTypeEnum.Happy:
      return 'brightness(1.2) saturate(1.3) drop-shadow(0 0 8px rgba(255,220,150,0.6))'

    case FilterTypeEnum.Sad:
      return 'grayscale(0.4) brightness(0.8) blur(1px)'

    case FilterTypeEnum.Lonely:
      return 'grayscale(0.6) contrast(0.9) brightness(0.7)'

    case FilterTypeEnum.Angry:
      return 'hue-rotate(-30deg) saturate(1.8) brightness(0.95)'

    case FilterTypeEnum.Shocked:
      return 'contrast(2) brightness(1.5)'

    case FilterTypeEnum.Nervous:
      return 'brightness(1.05) contrast(1.05)'

    case FilterTypeEnum.Embarrassed:
      return 'hue-rotate(330deg) saturate(1.2) brightness(1.1)'

    case FilterTypeEnum.Crying:
      return 'blur(2px) saturate(0.8) brightness(0.9)'

    case FilterTypeEnum.Fear:
      return 'grayscale(0.6) brightness(0.6) contrast(1.2)'

    case FilterTypeEnum.Inspired:
      return 'brightness(1.3) saturate(1.4) drop-shadow(0 0 10px rgba(255,255,180,0.8))'

    case FilterTypeEnum.Speechless:
      return 'grayscale(0.8) brightness(0.85) contrast(1.1)'

    default:
      return ''
  }
})

// 额外叠加遮罩（例如红色怒火、蓝色悲伤、暗角等）
const overlayColor = computed(() => {
  const t = props.filterNode.filterType
  switch (t) {
    case FilterTypeEnum.Angry:
      return 'rgba(255, 0, 0, 0.15)'
    case FilterTypeEnum.Sad:
      return 'rgba(0, 20, 60, 0.15)'
    case FilterTypeEnum.Lonely:
      return 'rgba(0, 0, 0, 0.25)'
    case FilterTypeEnum.Fear:
      return 'rgba(0, 0, 0, 0.35)'
    case FilterTypeEnum.Embarrassed:
      return 'rgba(255, 120, 160, 0.15)'
    default:
      return 'transparent'
  }
})
</script>

<template>
  <g
    :style="{
      pointerEvents: 'none',
      filter: filterStyle
    }"
    class="filter-layer"
  >
    <!-- 覆盖全屏的颜色叠层 -->
    <rect :fill="overlayColor" :height="canvasHeight" :width="canvasWidth" />

    <!-- 可加入噪点 / 扫描线 / vignette 等特效层（未来可扩展） -->
  </g>
</template>

<style scoped>
.filter-layer {
  will-change: filter;
  mix-blend-mode: normal; /* 或 overlay / soft-light 可根据滤镜需要调整 */
}
</style>
