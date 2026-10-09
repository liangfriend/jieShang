<script lang="ts" setup>
import { applySkinContentTemplate, type MusicScoreTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useEditorSkinItem } from '../editorSkin'

const props = withDefaults(
  defineProps<{
    skinKey: string
    notationType?: MusicScoreTypeEnum
    /** 预览框边长（px），字形等比缩放居中 */
    size?: number
    /** 皮肤缺字形时显示的文字 */
    fallback?: string
  }>(),
  {
    notationType: undefined,
    size: 22,
    fallback: '?'
  }
)

const resolveSkinItem = useEditorSkinItem()

const glyph = computed(() => {
  const item = resolveSkinItem(props.notationType, props.skinKey)
  if (!item?.content || !(item.w > 0) || !(item.h > 0)) return null
  return {
    viewBox: `0 0 ${item.w} ${item.h}`,
    content: applySkinContentTemplate(item.content, { w: item.w, h: item.h })
  }
})
</script>

<template>
  <svg
    v-if="glyph"
    class="note-mark-glyph"
    :height="size"
    :width="size"
    :viewBox="glyph.viewBox"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g v-html="glyph.content" />
  </svg>
  <span v-else class="note-mark-glyph__fallback" :style="{ height: `${size}px` }">
    {{ fallback }}
  </span>
</template>

<style scoped>
.note-mark-glyph {
  display: block;
  overflow: visible;
  pointer-events: none;
}

.note-mark-glyph__fallback {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-style: italic;
  font-weight: 700;
  color: #606266;
}
</style>
