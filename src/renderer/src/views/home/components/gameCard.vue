<script setup lang="ts">
import { computed, PropType, ref } from 'vue'

const props = defineProps({
  img: { type: String, default: '' },
  name: { type: String, default: '' },
  width: { type: String, default: '180px' },
  height: { type: String, default: '110px' },
  deleteable: { type: Boolean, default: false },
  type: { type: String as PropType<'work' | 'game'>, required: true },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'delete', 'edit'])

const cardStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

// 控制悬浮
const hover = ref(false)

// 点击卡片
const onClick = () => emit('select', props.name)

// 删除按钮点击
const onDelete = (e: MouseEvent) => {
  e.stopPropagation()
  emit('delete', props.name)
}
// 编辑按钮点击
const onEdit = (e: MouseEvent) => {
  e.stopPropagation()
  emit('edit', props.name)
}
</script>

<template>
  <div
    class="game-card no-user-select"
    :style="cardStyle"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="onClick"
  >
    <!-- 图片 -->
    <img v-if="img" class="thumb" :src="img" :alt="name" />
    <div v-else class="center h-full text-[50px] bg-[rgba(255,255,255,0.7)]">{{ name }}</div>

    <!-- 悬浮提示：名称 -->
    <div v-if="hover" class="name-tip">
      {{ name }}
    </div>
    <!-- ❌ 右上角删除按钮 -->
    <button v-if="hover && editable" class="edit-btn" @click="onEdit">编辑</button>
    <!-- ❌ 右上角删除按钮 -->
    <button v-if="hover && deleteable" class="delete-btn" @click="onDelete">✕</button>
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
  user-select: none;
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

/* 名称浮层 */
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

/* ❌ 删除按钮 */
.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  line-height: 26px;
  text-align: center;
  padding: 0;
  transition: background 0.15s ease;
}
/* 编辑按钮 */
.edit-btn {
  position: absolute;
  top: 6px;
  right: 36px;
  width: 36px;
  height: 26px;
  border-radius: 20%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  line-height: 26px;
  text-align: center;
  padding: 0;
  transition: background 0.15s ease;
}

.delete-btn:hover {
  background: rgba(255, 77, 79, 0.9);
}
.edit-btn:hover {
  background: rgb(230, 162, 60);
}

/* 动画 */
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
