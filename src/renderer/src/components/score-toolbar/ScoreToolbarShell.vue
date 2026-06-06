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
    <div class="score-toolbar__side score-toolbar__side--spacer" aria-hidden="true">
      <slot name="right" />
    </div>
  </footer>
</template>
