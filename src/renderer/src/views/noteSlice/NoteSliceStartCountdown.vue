<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NOTE_SLICE_START_COUNTDOWN_NUMERIC_STEPS,
  NOTE_SLICE_START_COUNTDOWN_STEP_MS
} from '@renderer/views/noteSlice/noteSliceGameMode'

const emit = defineEmits<{
  complete: []
}>()

const { t } = useI18n()

const countdownLabels = computed(() => [
  ...NOTE_SLICE_START_COUNTDOWN_NUMERIC_STEPS,
  t('noteSlice.countdown.start')
])

const currentLabel = ref<string>(countdownLabels.value[0]!)
let timerId = 0
let stepIndex = 0

onMounted(() => {
  timerId = window.setInterval(() => {
    stepIndex += 1
    if (stepIndex >= countdownLabels.value.length) {
      window.clearInterval(timerId)
      emit('complete')
      return
    }
    currentLabel.value = countdownLabels.value[stepIndex]!
  }, NOTE_SLICE_START_COUNTDOWN_STEP_MS)
})

onUnmounted(() => {
  window.clearInterval(timerId)
})
</script>

<template>
  <div class="note-slice-start-countdown" aria-live="polite">
    <span class="note-slice-start-countdown__label">{{ currentLabel }}</span>
  </div>
</template>

<style scoped>
.note-slice-start-countdown {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(7, 8, 24, 0.35);
}

.note-slice-start-countdown__label {
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 24px rgba(255, 220, 120, 0.55),
    0 0 48px rgba(255, 140, 180, 0.35);
  animation: note-slice-start-countdown-pop 0.35s ease-out;
}

@keyframes note-slice-start-countdown-pop {
  0% {
    transform: scale(0.6);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
