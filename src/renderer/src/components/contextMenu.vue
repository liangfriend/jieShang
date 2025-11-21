<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  x: number // 菜单显示位置
  y: number
  show: boolean // 是否显示
}>()

const emit = defineEmits(['close'])

const menuRef = ref<HTMLElement | null>(null)

// 位置修正（防止溢出屏幕）
const pos = ref({ left: 0, top: 0 })

function updatePosition() {
  if (!menuRef.value) return

  const menuWidth = menuRef.value.offsetWidth
  const menuHeight = menuRef.value.offsetHeight
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  let left = props.x
  let top = props.y

  if (left + menuWidth > screenWidth) {
    left = screenWidth - menuWidth - 5
  }
  if (top + menuHeight > screenHeight) {
    top = screenHeight - menuHeight - 5
  }

  pos.value = { left, top }
}

watch(
  () => props.show,
  async (val) => {
    if (val) {
      await nextTick()
      updatePosition()
    }
  }
)

// 点击外部关闭菜单
function handleClickOutside(e: MouseEvent) {
  if (!menuRef.value) return
  if (!menuRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="context-menu"
      ref="menuRef"
      :style="{
        position: 'fixed',
        left: pos.left + 'px',
        top: pos.top + 'px'
      }"
    >
      <!-- 用户插槽 -->
      <slot></slot>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  min-width: 160px;
  z-index: 9999;
  user-select: none;
}
</style>
