<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import {
  SINGING_COUNTDOWN_STEP_MS,
  SINGING_COUNTDOWN_STEPS
} from '@renderer/constant/singingCountdown'

const emit = defineEmits<{
  complete: []
}>()

const currentLabel = ref<string>(SINGING_COUNTDOWN_STEPS[0])
let timerId = 0
let stepIndex = 0

onMounted(() => {
  timerId = window.setInterval(() => {
    stepIndex += 1
    if (stepIndex >= SINGING_COUNTDOWN_STEPS.length) {
      window.clearInterval(timerId)
      timerId = 0
      emit('complete')
      return
    }
    currentLabel.value = SINGING_COUNTDOWN_STEPS[stepIndex]!
  }, SINGING_COUNTDOWN_STEP_MS)
})

onUnmounted(() => {
  if (timerId) window.clearInterval(timerId)
})
</script>

<template>
  <div class="singing-countdown" aria-live="polite">
    <span :key="currentLabel" class="singing-countdown__label">{{ currentLabel }}</span>
  </div>
</template>

<style scoped>
.singing-countdown {
  position: absolute;
  left: 10px;
  top: 50%;
  z-index: 12;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
}

.singing-countdown__label {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 22px rgba(255, 140, 180, 0.7),
    0 4px 14px rgba(40, 12, 36, 0.45);
  animation: singing-countdown-pop 0.35s ease-out;
}

@keyframes singing-countdown-pop {
  0% {
    transform: scale(0.55);
    opacity: 0.15;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
