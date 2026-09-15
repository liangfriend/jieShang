<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'

const { t } = useI18n()
const route = useRoute()

const title = computed(() => {
  const key = typeof route.meta.titleKey === 'string' ? route.meta.titleKey : ''
  return key ? t(key) : String(route.meta.title ?? '')
})

const placeholder = computed(() => {
  const key =
    typeof route.meta.placeholderKey === 'string' ? route.meta.placeholderKey : 'router.pagePlaceholder'
  return t(key)
})

const backFallback = computed(() =>
  typeof route.meta.backFallback === 'string' ? route.meta.backFallback : '/'
)
</script>

<template>
  <div class="sub-mode-page">
    <header class="sub-mode-page__header">
      <BackButton :fallback="backFallback" />
      <h1 class="sub-mode-page__title">{{ title }}</h1>
    </header>
    <main class="sub-mode-page__main">
      <p class="sub-mode-page__placeholder">{{ placeholder }}</p>
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
