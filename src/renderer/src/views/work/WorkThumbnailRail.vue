<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SJWPDF, { Page, type SJW } from '@deciphony/work'

defineOptions({ name: 'WorkThumbnailRail' })

const props = defineProps<{
  data: SJW
  pageIndex: number
  editable?: boolean
  pdfRef: InstanceType<typeof SJWPDF> | null
}>()

const emit = defineEmits<{
  select: [index: number]
  addPage: []
  insertPage: []
  removePage: []
}>()

const { t } = useI18n()

/** 缩略图框最大尺寸（栏宽约 148，去掉 padding） */
const THUMB_MAX_W = 112
const THUMB_MAX_H = 160

const pages = computed(() => props.data.pages ?? [])

function resolveThumb(src: string | undefined): string {
  if (!src) return ''
  return props.pdfRef?.resolveSrc(src) || src
}

/** 按最大框等比缩放，避免大页撑破缩略图栏 */
function thumbLayout(page: { width: number; height: number }) {
  const w = Math.max(1, page.width)
  const h = Math.max(1, page.height)
  const scale = Math.min(THUMB_MAX_W / w, THUMB_MAX_H / h)
  return {
    frameWidth: Math.max(1, Math.round(w * scale)),
    frameHeight: Math.max(1, Math.round(h * scale)),
    scale
  }
}
</script>

<template>
  <aside class="thumb-rail">
    <div class="thumb-rail__meta">
      <div class="thumb-rail__name">{{ data.name || t('work.title') }}</div>
      <div v-if="data.author" class="thumb-rail__author">{{ data.author }}</div>
      <div v-if="editable" class="thumb-rail__ops">
        <button type="button" @click="emit('addPage')">{{ t('work.pages.add') }}</button>
        <button type="button" @click="emit('insertPage')">{{ t('work.pages.insert') }}</button>
        <button type="button" @click="emit('removePage')">{{ t('work.pages.remove') }}</button>
      </div>
    </div>

    <button
      v-for="(page, index) in pages"
      :key="page.id"
      type="button"
      class="thumb-rail__item"
      :class="{ 'is-active': index === pageIndex }"
      @click="emit('select', index)"
    >
      <div
        class="thumb-rail__frame"
        :style="{
          width: `${thumbLayout(page).frameWidth}px`,
          height: `${thumbLayout(page).frameHeight}px`
        }"
      >
        <img
          v-if="page.thumbnail"
          class="thumb-rail__img"
          :alt="page.id"
          :src="resolveThumb(page.thumbnail)"
        />
        <div
          v-else
          class="thumb-rail__inner"
          :style="{
            width: `${page.width}px`,
            height: `${page.height}px`,
            transform: `scale(${thumbLayout(page).scale})`
          }"
        >
          <Page
            :page="page"
            thumbnail
            :resolve-src="(src) => pdfRef?.resolveSrc(src) || src"
          />
        </div>
      </div>
      <span class="thumb-rail__label">{{ index + 1 }}</span>
    </button>
  </aside>
</template>

<style scoped>
.thumb-rail {
  width: 148px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 10px;
  overflow: auto;
  border-right: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.92);
  box-sizing: border-box;
}

.thumb-rail__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.thumb-rail__name {
  font-size: 13px;
  font-weight: 800;
  color: #5c4a6a;
  word-break: break-word;
}

.thumb-rail__author {
  font-size: 11px;
  color: #9a8aa8;
}

.thumb-rail__ops {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.thumb-rail__ops button {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  border-radius: 8px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: #fff;
  font-size: 11px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.thumb-rail__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
}

.thumb-rail__item.is-active {
  border-color: #ff8fb8;
  background: rgba(255, 255, 255, 0.9);
}

.thumb-rail__frame {
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(200, 180, 200, 0.45);
  background: #fff;
  max-width: 100%;
}

.thumb-rail__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-rail__inner {
  transform-origin: top left;
  pointer-events: none;
}

.thumb-rail__label {
  font-size: 11px;
  font-weight: 700;
  color: #9a8aa8;
}
</style>
