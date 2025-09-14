<script setup lang="ts">
// const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <RouterView class="routerView"></RouterView>
</template>
<style scoped>
.routerView {
  width: 100%;
  height: 100%;
}
</style>
