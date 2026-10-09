<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAppLocale } from '@renderer/i18n/locale'
import {
  findToneColorCatalogItemByKey,
  toneColorCatalogName
} from '@renderer/constant/toneColorCatalog'
import { usePlayStore } from '@renderer/store/play.store'

defineOptions({ name: 'DevToneColorCacheOverlay' })

const { t, locale } = useI18n()
const playStore = usePlayStore()
const { cachedToneColorNames } = storeToRefs(playStore)
const collapsed = ref(true)

const rows = computed(() => {
  const appLocale = resolveAppLocale(locale.value)
  return [...cachedToneColorNames.value].sort().map((key) => {
    const item = findToneColorCatalogItemByKey(key)
    return { key, name: item ? toneColorCatalogName(item, appLocale) : '' }
  })
})
</script>

<template>
  <div class="dev-tone-cache">
    <header class="dev-tone-cache__header">
      <span class="dev-tone-cache__title">
        {{ t('play.devToneCache.title', { count: rows.length }) }}
      </span>
      <button type="button" class="dev-tone-cache__btn" @click="collapsed = !collapsed">
        {{ collapsed ? t('play.devToneCache.expand') : t('play.devToneCache.collapse') }}
      </button>
      <button
        type="button"
        class="dev-tone-cache__btn dev-tone-cache__btn--danger"
        :disabled="rows.length === 0"
        @click="playStore.clearCachedToneColors()"
      >
        {{ t('play.devToneCache.clear') }}
      </button>
    </header>
    <ul v-if="!collapsed" class="dev-tone-cache__list">
      <li v-for="row in rows" :key="row.key" class="dev-tone-cache__item">
        <span class="dev-tone-cache__key">{{ row.key }}</span>
        <span v-if="row.name" class="dev-tone-cache__name">{{ row.name }}</span>
      </li>
      <li v-if="rows.length === 0" class="dev-tone-cache__empty">{{ t('play.devToneCache.empty') }}</li>
    </ul>
  </div>
</template>

<style scoped>
.dev-tone-cache {
  position: fixed;
  top: 4px;
  left: 50%;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: min(720px, calc(100vw - 32px));
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(40, 40, 48, 0.55);
  color: #f2f2f5;
  font-size: 12px;
  transform: translateX(-50%);
  backdrop-filter: blur(2px);
}

.dev-tone-cache__header {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.dev-tone-cache__title {
  margin-right: auto;
  font-weight: 700;
}

.dev-tone-cache__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  max-height: 72px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.dev-tone-cache__item {
  display: flex;
  gap: 4px;
}

.dev-tone-cache__key {
  font-family: ui-monospace, Consolas, monospace;
}

.dev-tone-cache__name {
  opacity: 0.75;
}

.dev-tone-cache__empty {
  opacity: 0.7;
}

.dev-tone-cache__btn {
  padding: 1px 8px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dev-tone-cache__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dev-tone-cache__btn--danger {
  border-color: rgba(255, 120, 120, 0.6);
  background: rgba(255, 90, 90, 0.25);
}
</style>
