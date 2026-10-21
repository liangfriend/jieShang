<script lang="ts" setup>
import type { Chronaxie } from '@deciphony/renderer'
import { computed } from 'vue'
import {
  noteSymbolSvg,
  rest as restSymbolSvg
} from '@renderer/views/editor/editHelper/standardStaff/noteSvg'

const props = withDefaults(
  defineProps<{
    chronaxie: Chronaxie
    kind?: 'note' | 'rest'
  }>(),
  { kind: 'note' }
)

const innerHtml = computed(() => {
  if (props.kind === 'rest') {
    return (restSymbolSvg as Record<number, string>)[props.chronaxie] ?? ''
  }
  return (noteSymbolSvg.up as Record<number, string>)[props.chronaxie] ?? ''
})

const viewBox = computed(() =>
  props.kind === 'rest' ? '-2 -12 20 36' : '-2 -34 20 52'
)
</script>

<template>
  <svg
    class="chronaxie-glyph"
    :class="{ 'chronaxie-glyph--rest': kind === 'rest' }"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    v-html="innerHtml"
  />
</template>

<style scoped>
.chronaxie-glyph {
  width: 22px;
  height: 28px;
  display: block;
  overflow: visible;
  color: currentColor;
  pointer-events: none;
}

.chronaxie-glyph--rest {
  width: 18px;
  height: 24px;
}

.chronaxie-glyph :deep(path),
.chronaxie-glyph :deep(rect) {
  fill: currentColor !important;
  stroke: currentColor !important;
  opacity: 1 !important;
}
</style>
