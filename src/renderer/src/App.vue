<script setup lang="ts">
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import GlobalLoading from '@renderer/components/GlobalLoading.vue'
import { useLocaleStore } from '@renderer/store/locale.store'

const localeStore = useLocaleStore()

const elementLocale = computed(() => (localeStore.locale === 'zh' ? zhCn : en))
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
