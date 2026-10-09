<script lang="ts" setup>
defineProps<{
  title?: string
}>()
</script>

<template>
  <section class="panel-group">
    <header v-if="title || $slots.extra" class="panel-group__header">
      <span class="panel-group__title">{{ title }}</span>
      <span class="panel-group__extra"><slot name="extra" /></span>
    </header>
    <div class="panel-group__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel-group {
  margin-bottom: 10px;
  padding: 10px 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(201, 184, 255, 0.35);
}

.panel-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.panel-group__title {
  font-size: 12px;
  font-weight: 700;
  color: #8a6fb0;
  letter-spacing: 0.04em;
}

.panel-group__extra {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.panel-group__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
