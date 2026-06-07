<script setup lang="ts">
import { computed, useSlots } from 'vue'
import './score-toolbar.css'

const slots = useSlots()
const hasRightSlot = computed(() => Boolean(slots.right))
</script>

<template>
  <footer class="score-toolbar">
    <div class="score-toolbar__side">
      <slot name="left" />
    </div>
    <div class="score-toolbar__center">
      <slot name="center" />
    </div>
    <div
      class="score-toolbar__side"
      :class="{ 'score-toolbar__side--spacer': !hasRightSlot }"
      :aria-hidden="hasRightSlot ? undefined : 'true'"
    >
      <slot name="right" />
    </div>
  </footer>
</template>
