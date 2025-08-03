<template>
  <div class="container">
    <TDBox :modelUrl="guitar" :width="1000" :height="1000"/>
  </div>
</template>
<script setup lang="ts">
import TDBox from '@/applications/ChuangKeApplication/components/threeBox.vue'
import guitar from '@/assets/models/guitar/Ukulele_01_4k.gltf'
</script>
<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
