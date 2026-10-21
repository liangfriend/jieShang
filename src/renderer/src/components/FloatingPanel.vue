<script lang="ts">
/** 本次运行内按 positionKey 记住各弹窗位置，再打开时停在原处 */
const lastPositions = new Map<string, { x: number; y: number }>()
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 可拖拽浮动窗口：挂到 body，按住标题栏拖动，右上角 × 关闭；点外部不关闭。
 * 首次打开时出现在 anchor 上方。
 */
const props = defineProps<{
  title: string
  /** 记住位置用的键，同一种弹窗共用 */
  positionKey: string
  anchor?: HTMLElement | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const MARGIN = 8

const panelRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
let drag: { pointerId: number; dx: number; dy: number } | null = null

function clampPosition(x: number, y: number) {
  const el = panelRef.value
  const w = el?.offsetWidth ?? 0
  const h = el?.offsetHeight ?? 0
  return {
    x: Math.min(Math.max(MARGIN, x), Math.max(MARGIN, window.innerWidth - w - MARGIN)),
    y: Math.min(Math.max(MARGIN, y), Math.max(MARGIN, window.innerHeight - h - MARGIN))
  }
}

function initialPosition() {
  const last = lastPositions.get(props.positionKey)
  if (last) return clampPosition(last.x, last.y)
  const el = panelRef.value
  const w = el?.offsetWidth ?? 0
  const h = el?.offsetHeight ?? 0
  const rect = props.anchor?.getBoundingClientRect()
  if (!rect) return clampPosition((window.innerWidth - w) / 2, (window.innerHeight - h) / 2)
  const above = rect.top - h - 12
  const y = above >= MARGIN ? above : rect.bottom + 12
  return clampPosition(rect.left + rect.width / 2 - w / 2, y)
}

function onHeaderPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  if ((event.target as HTMLElement).closest('button')) return
  drag = {
    pointerId: event.pointerId,
    dx: event.clientX - position.value.x,
    dy: event.clientY - position.value.y
  }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  event.preventDefault()
}

function onHeaderPointerMove(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId) return
  position.value = clampPosition(event.clientX - drag.dx, event.clientY - drag.dy)
}

function onHeaderPointerUp(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId) return
  drag = null
  lastPositions.set(props.positionKey, { ...position.value })
}

function onWindowResize() {
  position.value = clampPosition(position.value.x, position.value.y)
}

onMounted(() => {
  position.value = initialPosition()
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  lastPositions.set(props.positionKey, { ...position.value })
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="panelRef"
      class="floating-panel"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    >
      <div
        class="floating-panel__header"
        @pointerdown="onHeaderPointerDown"
        @pointermove="onHeaderPointerMove"
        @pointerup="onHeaderPointerUp"
        @pointercancel="onHeaderPointerUp"
      >
        <span class="floating-panel__title">{{ title }}</span>
        <button
          type="button"
          class="floating-panel__close"
          :aria-label="t('common.close')"
          @click="emit('close')"
        >
          ×
        </button>
      </div>
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.floating-panel {
  position: fixed;
  z-index: 60;
  padding: 0 12px 12px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 248, 251, 0.98);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.22);
  user-select: none;
}

.floating-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  cursor: move;
  touch-action: none;
}

.floating-panel__title {
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
}

.floating-panel__close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #8a7699;
  font-size: 18px;
  line-height: 24px;
  cursor: pointer;
}

.floating-panel__close:hover {
  background: rgba(201, 184, 255, 0.3);
  color: #5c4a6a;
}
</style>
