<script setup lang="ts">
import './score-toolbar.css'
</script>

<template>
  <footer class="score-toolbar">
    <div class="score-toolbar__side">
      <slot name="left" />
    </div>
    <div class="score-toolbar__center">
      <slot name="center" />
    </div>
  </footer>
</template>
