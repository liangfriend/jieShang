<script setup lang="ts">
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import ja from 'element-plus/es/locale/lang/ja'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import GlobalLoading from '@renderer/components/GlobalLoading.vue'
import { useLocaleStore } from '@renderer/store/locale.store'
import type { AppLocale } from '@renderer/i18n/locale'

const localeStore = useLocaleStore()

const ELEMENT_LOCALES = { zh: zhCn, en, ja } satisfies Record<AppLocale, unknown>

const elementLocale = computed(() => ELEMENT_LOCALES[localeStore.locale])
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <router-view />
    <GlobalLoading />
  </ElConfigProvider>
</template>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
