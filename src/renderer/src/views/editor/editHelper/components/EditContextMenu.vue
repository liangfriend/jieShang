<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { EditContextMenuEntry } from '../renderEditContextMenu'

const props = defineProps<{
  x: number
  y: number
  items: EditContextMenuEntry[]
}>()

const emit = defineEmits<{
  close: []
}>()

const rootRef = ref<HTMLElement | null>(null)
const pos = ref({ left: props.x, top: props.y })

const style = computed(() => ({
  left: `${pos.value.left}px`,
  top: `${pos.value.top}px`
}))

function clampToViewport() {
  const el = rootRef.value
  if (!el) return
  const pad = 8
  const rect = el.getBoundingClientRect()
  let left = props.x
  let top = props.y
  if (left + rect.width > window.innerWidth - pad) {
    left = Math.max(pad, window.innerWidth - rect.width - pad)
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - rect.height - pad)
  }
  pos.value = { left, top }
}

function onDocPointerDown(ev: Event) {
  const t = ev.target
  if (t instanceof Node && rootRef.value?.contains(t)) return
  emit('close')
}

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') emit('close')
}

function onScroll() {
  emit('close')
}

function onItemPointerDown(ev: Event) {
  // 必须拦住 pointerdown，否则菜单关闭后 pointerup 会落到曲谱上触发添加音符
  ev.preventDefault()
  ev.stopPropagation()
}

const openIndex = ref<number | null>(null)
const submenuRef = ref<HTMLElement | HTMLElement[] | null>(null)
const submenuFlip = ref(false)
const submenuShiftY = ref(0)

async function openSubmenu(index: number | null) {
  if (openIndex.value === index) return
  openIndex.value = index
  submenuFlip.value = false
  submenuShiftY.value = 0
  if (index == null) return
  await nextTick()
  const el = Array.isArray(submenuRef.value) ? submenuRef.value[0] : submenuRef.value
  if (!el) return
  const pad = 8
  const rect = el.getBoundingClientRect()
  submenuFlip.value = rect.right > window.innerWidth - pad
  if (rect.bottom > window.innerHeight - pad) {
    submenuShiftY.value = Math.min(rect.top - pad, rect.bottom - (window.innerHeight - pad))
  }
}

function onItemEnter(item: EditContextMenuEntry, index: number) {
  void openSubmenu(item.children && !item.disabled ? index : null)
}

function run(item: EditContextMenuEntry, ev?: Event) {
  if (item.children) {
    ev?.preventDefault()
    ev?.stopPropagation()
    return
  }
  if (item.disabled) {
    ev?.preventDefault()
    ev?.stopPropagation()
    return
  }
  ev?.preventDefault()
  ev?.stopPropagation()
  try {
    item.action()
  } finally {
    emit('close')
  }
}

onMounted(async () => {
  await nextTick()
  clampToViewport()
  requestAnimationFrame(() => {
    document.addEventListener('pointerdown', onDocPointerDown, true)
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('scroll', onScroll, true)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll, true)
})

watch(
  () => [props.x, props.y] as const,
  async () => {
    pos.value = { left: props.x, top: props.y }
    await nextTick()
    clampToViewport()
  }
)
</script>

<template>
  <Teleport to="body">
    <ul
      ref="rootRef"
      class="edit-context-menu"
      role="menu"
      :style="style"
      @contextmenu.prevent
    >
      <li
        v-for="(item, i) in items"
        :key="`${item.text}-${i}`"
        class="edit-context-menu__item"
        :class="{
          'edit-context-menu__item--danger': item.danger,
          'edit-context-menu__item--disabled': item.disabled,
          'edit-context-menu__item--parent': item.children,
          'edit-context-menu__item--open': openIndex === i
        }"
        :aria-disabled="item.disabled ? 'true' : undefined"
        :aria-haspopup="item.children ? 'menu' : undefined"
        role="menuitem"
        @pointerenter="onItemEnter(item, i)"
        @pointerdown.prevent.stop="onItemPointerDown"
        @pointerup.prevent.stop
        @click.prevent.stop="run(item, $event)"
      >
        {{ item.text }}
        <span v-if="item.children" class="edit-context-menu__arrow">›</span>
        <ul
          v-if="item.children && openIndex === i"
          ref="submenuRef"
          class="edit-context-menu edit-context-menu--sub"
          :class="{ 'edit-context-menu--flip': submenuFlip }"
          :style="{ marginTop: `${-submenuShiftY}px` }"
          role="menu"
        >
          <li
            v-for="(child, j) in item.children"
            :key="`${child.text}-${j}`"
            class="edit-context-menu__item"
            :class="{
              'edit-context-menu__item--danger': child.danger,
              'edit-context-menu__item--disabled': child.disabled
            }"
            :aria-disabled="child.disabled ? 'true' : undefined"
            role="menuitem"
            @pointerdown.prevent.stop="onItemPointerDown"
            @pointerup.prevent.stop
            @click.prevent.stop="run(child, $event)"
          >
            {{ child.text }}
          </li>
        </ul>
      </li>
    </ul>
  </Teleport>
</template>

<style scoped>
.edit-context-menu {
  position: fixed;
  z-index: 10000;
  margin: 0;
  padding: 4px 0;
  min-width: 140px;
  list-style: none;
  background: #fff;
  border: 1px solid rgba(255, 184, 208, 0.45);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(200, 140, 180, 0.18);
  font-size: 13px;
  color: #5c4a6a;
  user-select: none;
}

.edit-context-menu__item {
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
}

.edit-context-menu__item--parent {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.edit-context-menu__item--open {
  background: rgba(255, 214, 232, 0.55);
}

.edit-context-menu__arrow {
  font-size: 15px;
  line-height: 1;
  color: #b49ac4;
}

.edit-context-menu--sub {
  position: absolute;
  left: 100%;
  top: -5px;
  min-width: 110px;
}

.edit-context-menu--flip {
  left: auto;
  right: 100%;
}

.edit-context-menu__item:hover {
  background: rgba(255, 214, 232, 0.55);
}

.edit-context-menu__item--danger {
  color: #f56c6c;
}

.edit-context-menu__item--danger:hover {
  background: #fef0f0;
}

.edit-context-menu__item--disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.edit-context-menu__item--disabled:hover {
  background: transparent;
}

.edit-context-menu__item--danger.edit-context-menu__item--disabled {
  color: #f9c0c0;
}

.edit-context-menu__item--danger.edit-context-menu__item--disabled:hover {
  background: transparent;
}
</style>
