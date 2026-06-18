<script lang="ts" setup>
defineProps<{
  visible: boolean
  text?: string
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="global-loading-fade">
      <div v-if="visible" class="global-loading" role="status" aria-live="polite" aria-busy="true">
        <div class="global-loading__panel">
          <div class="global-loading__spinner" aria-hidden="true" />
          <p class="global-loading__text">{{ text ?? '加载中…' }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.global-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 248, 251, 0.82);
  backdrop-filter: blur(4px);
}

.global-loading__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 36px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 32px rgba(214, 51, 108, 0.12);
  border: 1px solid rgba(255, 184, 208, 0.45);
}

.global-loading__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 184, 208, 0.35);
  border-top-color: #d6336c;
  border-radius: 50%;
  animation: global-loading-spin 0.75s linear infinite;
}

.global-loading__text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #8a5a72;
  letter-spacing: 0.02em;
}

.global-loading-fade-enter-active,
.global-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.global-loading-fade-enter-from,
.global-loading-fade-leave-to {
  opacity: 0;
}

@keyframes global-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
