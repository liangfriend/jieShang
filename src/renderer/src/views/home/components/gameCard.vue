<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps({
  img: { type: String, default: '' },
  name: { type: String, default: '' },
  width: { type: String, default: '180px' },
  height: { type: String, default: '110px' }
})

const emit = defineEmits(['select'])

const cardStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

// 控制悬浮时提示显示
const hover = ref(false)

const onClick = () => emit('select', props.name)
</script>

<template>
  <div
    class="game-card"
    :style="cardStyle"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="onClick"
  >
    <!-- 图片 -->
    <img class="thumb" :src="img" :alt="name" />

    <!-- 悬浮显示名称 -->
    <div v-if="hover" class="name-tip">
      {{ name }}
    </div>
  </div>
</template>

<style scoped>
.game-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 鼠标放大 */
.game-card:hover {
  transform: scale(1.04);
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 悬浮提示 */
.name-tip {
  position: absolute;
  bottom: 6px;
  left: 10px;
  right: 10px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
