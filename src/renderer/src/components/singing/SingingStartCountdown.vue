<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

const STEPS = ['3', '2', '1'] as const
const STEP_MS = 1000

const emit = defineEmits<{
  complete: []
}>()

const currentLabel = ref<string>(STEPS[0])
let timerId = 0
let stepIndex = 0

onMounted(() => {
  timerId = window.setInterval(() => {
    stepIndex += 1
    if (stepIndex >= STEPS.length) {
      window.clearInterval(timerId)
      timerId = 0
      emit('complete')
      return
    }
    currentLabel.value = STEPS[stepIndex]!
  }, STEP_MS)
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
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(40, 16, 36, 0.38);
  backdrop-filter: blur(2px);
}

.singing-countdown__label {
  font-size: 108px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 28px rgba(255, 140, 180, 0.55),
    0 8px 24px rgba(40, 12, 36, 0.35);
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
