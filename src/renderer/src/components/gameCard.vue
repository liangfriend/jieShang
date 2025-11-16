<script setup lang="ts">
import { PropType, computed, ref } from 'vue'

const props = defineProps({
  game: {
    type: Object as PropType<{
      id: number
      name: string
      description?: string
      frontCover?: string
    }>,
    required: true
  },
  width: {
    type: [String, Number],
    default: 220
  },
  height: {
    type: [String, Number],
    default: 300
  }
})

// 封面是否加载失败
const imageError = ref(false)

// 随机颜色池（你可以继续添加）
const placeholderColors = [
  '#8e44ad',
  '#3498db',
  '#1abc9c',
  '#e67e22',
  '#e74c3c',
  '#2ecc71',
  '#9b59b6',
  '#34495e'
]

// 通过 id hash 固定颜色，避免刷新改变颜色
function pickColorFromId(id: number) {
  let hash = 0
  for (let i = 0; i < ('' + id).length; i++) {
    hash = ('' + id).charCodeAt(i) + ((hash << 5) - hash)
  }
  return placeholderColors[Math.abs(hash) % placeholderColors.length]
}

const coverBackground = computed(() => pickColorFromId(props.game.id))

// 动态样式
const cardStyle = computed(() => {
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  const h = typeof props.height === 'number' ? `${props.height}px` : props.height
  return { width: w, height: h }
})

// 如果封面加载失败 → 隐藏 img 显示背景色
function onImgError() {
  imageError.value = true
}
</script>

<template>
  <div class="game-card" :style="cardStyle">
    <div
      class="cover"
      :style="{ backgroundColor: imageError || !game.frontCover ? coverBackground : undefined }"
    >
      <img
        v-if="!imageError && game.frontCover"
        :src="game.frontCover"
        alt="cover"
        @error="onImgError"
      />
    </div>

    <div class="info">
      <div class="title">{{ game.name }}</div>
      <div v-if="game.description" class="desc">{{ game.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.game-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

.cover {
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  padding: 10px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  font-size: 12px;
  opacity: 0.75;
  height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
