<script lang="ts" setup>
import BackButton from '@renderer/components/BackButton.vue'
</script>

<template>
  <div class="note-slice-extreme-placeholder">
    <header class="note-slice-extreme-placeholder__header">
      <BackButton fallback="/" />
    </header>

    <main class="note-slice-extreme-placeholder__main">
      <h1 class="note-slice-extreme-placeholder__title">极限模式</h1>
      <p class="note-slice-extreme-placeholder__desc">敬请期待</p>
    </main>
  </div>
</template>

<style scoped>
.note-slice-extreme-placeholder {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #070818;
  color: #fff;
}

.note-slice-extreme-placeholder__header {
  padding: 16px;
}

.note-slice-extreme-placeholder__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.note-slice-extreme-placeholder__title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
}

.note-slice-extreme-placeholder__desc {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.65);
}
</style>
