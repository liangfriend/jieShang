<script setup lang="ts">
import GlobalLoading from '@renderer/components/GlobalLoading.vue'
</script>

<template>
  <router-view />
  <GlobalLoading />
</template>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
