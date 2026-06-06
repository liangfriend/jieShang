<script lang="ts" setup>
import BackButton from '@renderer/components/BackButton.vue'
</script>

<template>
  <div class="sub-mode-page">
    <header class="sub-mode-page__header">
      <BackButton fallback="/" />
      <h1 class="sub-mode-page__title">新手模式</h1>
    </header>
    <main class="sub-mode-page__main">
      <p class="sub-mode-page__placeholder">新手模式页面开发中</p>
    </main>
  </div>
</template>

<style scoped>
.sub-mode-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff8fb;
}

.sub-mode-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
}

.sub-mode-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.sub-mode-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.sub-mode-page__placeholder {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
