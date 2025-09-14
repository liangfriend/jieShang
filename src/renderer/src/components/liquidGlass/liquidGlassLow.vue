<script setup lang="ts">
import { computed } from 'vue'
import { defaultProps } from 'element-plus'
const props = defineProps({
  width: {
    default: '100%'
  },
  height: {
    default: '100%'
  },
  borderRadius: {
    default: '50%'
  },
  blur: {
    default: '1'
  }
})
const wrapperStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    borderRadius: props.borderRadius,
    overflow: 'hidden'
  }
})
const coverStyle = computed(() => {
  return {
    backdropFilter: `blur(${props.blur}px)`,
    borderRadius: props.borderRadius,
  }
})
</script>

<template>
  <svg style="display: none">
    <defs>
      <filter
        id="liquid_glass_filter"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feDisplacementMap scale="200" />
      </filter>
    </defs>
  </svg>
  <div class="liquid_glass-wrapper" :style="wrapperStyle">
    <div class="liquid_glass-outer" :style="{ borderRadius }"></div>
    <div class="liquid_glass-cover" :style="coverStyle"></div>
    <div class="liquid_glass-sharp"></div>
    <div class="liquid_glass-reflect" :style="{ borderRadius }">
      <slot name="default"></slot>
    </div>
    <slot name="back"></slot>
  </div>
</template>

<style scoped>
.liquid_glass-wrapper {
  position: relative;
}
.liquid_glass-outer {
  backdrop-filter: url(#liquid_glass_filter);
  position: absolute;
  inset: 0;
  z-index: 0;

  mask-image:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect x="0" y="0" width="100%" height="100%" rx="0" ry="0" fill="white"/></svg>'),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect x="5" y="5" width="calc(100% - 10px)" height="calc(100% - 10px)" rx="21" ry="21" fill="white"/></svg>');
  mask-composite: exclude;
}

.liquid_glass-cover {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: rgba(0, 0, 0, 0.12);
}

.liquid_glass-sharp {
  position: absolute;
  inset: 0;
  z-index: 3;

  box-shadow:
    inset 1px 1px 0px 0px rgba(255, 255, 255, 0.5),
    inset -1px -1px 0px 0px rgba(255, 255, 255, 0.6);
}

.liquid_glass-reflect {
  position: absolute;
  inset: 1px;
  z-index: 2;

  box-shadow:
    inset 2px 2px 6px 2px rgba(255, 255, 255, 0.2),
    inset -2px -2px 4px -1px rgba(255, 255, 255, 0.2);
}
</style>
