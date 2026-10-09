<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PanFluteModel } from '@renderer/constant/panFlute'
import { midiToNoteName, noteNameToNoteString } from '@renderer/utils/noteNameDisplay'

const props = defineProps<{
  model: PanFluteModel
  disabled?: boolean
}>()

const emit = defineEmits<{
  /** 当前正在吹的管（null = 未吹） */
  active: [midi: number | null]
}>()

/** 最短管相对最长管的高度比例 */
const SHORTEST_RATIO = 0.36

const pipesRef = ref<HTMLElement | null>(null)
/** 嘴位指针相对管排左边的 x（像素），null 表示指针不在管排上 */
const pointerX = ref<number | null>(null)
const hoverIndex = ref<number | null>(null)
const blowing = ref(false)

const pipes = computed(() => {
  const list = props.model.midis
  const min = list[0] ?? 60
  const max = list[list.length - 1] ?? min
  const span = Math.max(1, max - min)
  return list.map((midi) => {
    // 管长随音高按指数缩短
    const t = (midi - min) / span
    const heightRatio = Math.pow(SHORTEST_RATIO, t)
    return {
      midi,
      label: noteNameToNoteString(midiToNoteName(midi)),
      heightPercent: heightRatio * 100
    }
  })
})

const activeIndex = computed(() => (blowing.value ? hoverIndex.value : null))

watch(activeIndex, (idx) => {
  emit('active', idx == null ? null : (pipes.value[idx]?.midi ?? null))
})

watch(
  () => props.model.id,
  () => {
    blowing.value = false
    hoverIndex.value = null
  }
)

watch(
  () => props.disabled,
  (d) => {
    if (d) blowing.value = false
  }
)

function locate(ev: PointerEvent) {
  const el = pipesRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = ev.clientX - rect.left
  if (x < 0 || x > rect.width) {
    pointerX.value = null
    hoverIndex.value = null
    return
  }
  pointerX.value = x
  const n = pipes.value.length
  hoverIndex.value = Math.min(n - 1, Math.max(0, Math.floor((x / rect.width) * n)))
}

function onPointerMove(ev: PointerEvent) {
  if (props.disabled) return
  locate(ev)
}

function onPointerDown(ev: PointerEvent) {
  if (props.disabled || ev.button !== 0) return
  ev.preventDefault()
  locate(ev)
  ;(ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId)
  blowing.value = true
}

function stopBlow() {
  blowing.value = false
}

function onPointerUp(ev: PointerEvent) {
  if (ev.button === 0) stopBlow()
}

function onPointerLeave() {
  if (blowing.value) return
  pointerX.value = null
  hoverIndex.value = null
}

// 按住吹气时切走窗口可能收不到 pointerup
onMounted(() => window.addEventListener('blur', stopBlow))

onUnmounted(() => {
  window.removeEventListener('blur', stopBlow)
  stopBlow()
})
</script>

<template>
  <div
    class="pan-flute-panel"
    :class="{ 'pan-flute-panel--disabled': disabled }"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="stopBlow"
    @pointerleave="onPointerLeave"
    @contextmenu.prevent
  >
    <div ref="pipesRef" class="pan-flute-panel__pipes">
      <div
        v-if="pointerX != null"
        class="pan-flute-panel__mouth"
        :class="{ 'pan-flute-panel__mouth--blowing': blowing }"
        :style="{ left: `${pointerX}px` }"
        aria-hidden="true"
      />
      <div
        v-for="(pipe, i) in pipes"
        :key="`${model.id}-${pipe.midi}`"
        class="pan-flute-panel__slot"
      >
        <div
          class="pan-flute-panel__pipe"
          :class="{
            'pan-flute-panel__pipe--hover': hoverIndex === i && !blowing,
            'pan-flute-panel__pipe--active': activeIndex === i
          }"
          :style="{ height: `${pipe.heightPercent}%` }"
        >
          <span class="pan-flute-panel__hole" />
          <span class="pan-flute-panel__label">{{ pipe.label }}</span>
        </div>
      </div>
      <div class="pan-flute-panel__band" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.pan-flute-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 220px;
  padding: 28px 24px 16px;
  box-sizing: border-box;
  border-radius: 16px;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.6), transparent 60%),
    linear-gradient(180deg, #f6efe4 0%, #e9dfd0 100%);
  user-select: none;
  touch-action: none;
  cursor: none;
  display: flex;
  justify-content: center;
}

.pan-flute-panel--disabled {
  cursor: wait;
  opacity: 0.72;
  pointer-events: none;
}

.pan-flute-panel__pipes {
  position: relative;
  height: 100%;
  width: min(100%, 1100px);
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: start;
}

.pan-flute-panel__slot {
  height: 100%;
  padding: 0 3px;
  box-sizing: border-box;
}

.pan-flute-panel__pipe {
  position: relative;
  width: 100%;
  border-radius: 10px 10px 14px 14px;
  background: linear-gradient(90deg, #b88a4a 0%, #e8c98e 35%, #f4dcaa 50%, #d8b074 70%, #a47838 100%);
  box-shadow:
    inset 0 -6px 10px rgba(90, 60, 20, 0.25),
    0 4px 10px rgba(120, 90, 50, 0.2);
  transition:
    filter 0.08s ease,
    transform 0.08s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 8px;
  box-sizing: border-box;
}

.pan-flute-panel__pipe--hover {
  filter: brightness(1.06);
}

.pan-flute-panel__pipe--active {
  filter: brightness(1.12) saturate(1.2);
  transform: translateY(2px);
  box-shadow:
    inset 0 -6px 10px rgba(90, 60, 20, 0.25),
    0 0 14px rgba(255, 140, 80, 0.7);
}

.pan-flute-panel__hole {
  width: 62%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, #2a1a0a 40%, #5a3a18 100%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.pan-flute-panel__pipe--active .pan-flute-panel__hole {
  background: radial-gradient(circle, #ff6b3d 20%, #5a3a18 100%);
}

.pan-flute-panel__label {
  font-size: 11px;
  font-weight: 700;
  color: #5a3a18;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: -1px;
}

.pan-flute-panel__band {
  position: absolute;
  left: -6px;
  right: -6px;
  top: 24%;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(180deg, #8a5a2a, #6a4018);
  box-shadow: 0 2px 4px rgba(60, 30, 10, 0.3);
  pointer-events: none;
  z-index: 2;
}

.pan-flute-panel__mouth {
  position: absolute;
  top: -22px;
  width: 0;
  height: 0;
  margin-left: -9px;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 16px solid #e03131;
  pointer-events: none;
  z-index: 3;
  transition: border-top-color 0.08s ease;
}

.pan-flute-panel__mouth--blowing {
  border-top-color: #ff6b3d;
  filter: drop-shadow(0 0 4px rgba(255, 107, 61, 0.8));
}
</style>
