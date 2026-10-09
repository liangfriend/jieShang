<script lang="ts" setup>
import { computed } from 'vue'
import type { KalimbaModel } from '@renderer/constant/kalimba'
import { midiToNoteName, noteNameToNoteString } from '@renderer/utils/noteNameDisplay'

const props = defineProps<{
  model: KalimbaModel
  activeMidis: Set<number>
  disabled?: boolean
}>()

const emit = defineEmits<{
  press: [midi: number]
  release: [midi: number]
}>()

/** 最短琴键相对最长琴键的长度比例 */
const SHORTEST_RATIO = 0.5

const tines = computed(() => {
  const midis = props.model.tines.map((t) => t.midi)
  const min = Math.min(...midis)
  const max = Math.max(...midis)
  const span = Math.max(1, max - min)
  return props.model.tines.map((tine) => ({
    ...tine,
    label: noteNameToNoteString(midiToNoteName(tine.midi)),
    heightPercent: Math.pow(SHORTEST_RATIO, (tine.midi - min) / span) * 100
  }))
})

function onPointerDown(ev: PointerEvent, midi: number) {
  if (props.disabled || ev.button !== 0) return
  ev.preventDefault()
  ;(ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId)
  emit('press', midi)
}
</script>

<template>
  <div
    class="kalimba-panel"
    :class="{ 'kalimba-panel--disabled': disabled }"
    @contextmenu.prevent
  >
    <div class="kalimba-panel__board">
      <div class="kalimba-panel__bridge" aria-hidden="true" />
      <div class="kalimba-panel__tines">
        <div v-for="tine in tines" :key="`${model.id}-${tine.midi}`" class="kalimba-panel__slot">
          <button
            type="button"
            class="kalimba-panel__tine"
            :class="{ 'kalimba-panel__tine--active': activeMidis.has(tine.midi) }"
            :style="{ height: `${tine.heightPercent}%` }"
            @pointerdown="onPointerDown($event, tine.midi)"
            @pointerup="emit('release', tine.midi)"
            @pointercancel="emit('release', tine.midi)"
          >
            <span class="kalimba-panel__note">{{ tine.label }}</span>
            <span class="kalimba-panel__key">{{ tine.key.toUpperCase() }}</span>
          </button>
        </div>
      </div>
      <div class="kalimba-panel__sound-hole" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.kalimba-panel {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  user-select: none;
  touch-action: none;
}

.kalimba-panel--disabled {
  cursor: wait;
  opacity: 0.72;
  pointer-events: none;
}

.kalimba-panel__board {
  position: relative;
  width: min(100%, 980px);
  height: 100%;
  padding: 26px 28px 18px;
  box-sizing: border-box;
  border-radius: 22px 22px 60px 60px;
  background: linear-gradient(180deg, #c89560 0%, #a8733f 60%, #8e5e30 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    0 10px 28px rgba(110, 70, 30, 0.28);
}

.kalimba-panel__bridge {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 18px;
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(180deg, #e8e8ee, #9a9aa6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.kalimba-panel__tines {
  position: relative;
  height: 100%;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: start;
  z-index: 1;
}

.kalimba-panel__slot {
  height: 100%;
  padding: 0 3px;
  box-sizing: border-box;
}

.kalimba-panel__tine {
  width: 100%;
  border: none;
  padding: 0 0 8px;
  border-radius: 0 0 12px 12px;
  background: linear-gradient(90deg, #9ea3ad 0%, #eef0f4 45%, #d4d7de 60%, #8d929c 100%);
  box-shadow: 0 3px 6px rgba(40, 30, 20, 0.35);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  transition:
    transform 0.06s ease,
    filter 0.06s ease;
}

.kalimba-panel__tine:hover {
  filter: brightness(1.05);
}

.kalimba-panel__tine--active {
  transform: translateY(3px);
  filter: brightness(1.1);
  background: linear-gradient(90deg, #d08a5a 0%, #ffe0c4 45%, #f4c29a 60%, #c07a48 100%);
  box-shadow: 0 0 14px rgba(255, 150, 90, 0.8);
}

.kalimba-panel__note {
  font-size: 11px;
  font-weight: 700;
  color: #3a3a48;
}

.kalimba-panel__key {
  min-width: 20px;
  padding: 1px 4px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: rgba(92, 74, 106, 0.78);
}

.kalimba-panel__sound-hole {
  position: absolute;
  left: 50%;
  bottom: 14px;
  width: 44px;
  height: 44px;
  margin-left: -22px;
  border-radius: 50%;
  background: radial-gradient(circle, #3a2210 55%, #6a4420 100%);
  opacity: 0.6;
  z-index: 0;
}
</style>
