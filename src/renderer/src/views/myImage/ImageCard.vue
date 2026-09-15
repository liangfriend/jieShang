<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete } from '@element-plus/icons-vue'
import type { ImageListItem } from '@renderer/utils/fileHelper/imageFile'
import {
  displayMediaName,
  toPlayableMediaUrl
} from '@renderer/utils/fileHelper/mediaFile'
import { probeImageMetadata } from '@renderer/views/myImage/imageMetadata'

defineOptions({ name: 'ImageCard' })

const props = defineProps<{
  item: ImageListItem
  deleting?: boolean
}>()

const emit = defineEmits<{
  openDetail: []
  delete: [event: Event]
}>()

const { t } = useI18n()

const src = computed(() => toPlayableMediaUrl('image', props.item.url))

watch(
  () => props.item.id,
  (id) => {
    void probeImageMetadata(id, props.item.url)
  },
  { immediate: true }
)
</script>

<template>
  <article class="image-card" @click="emit('openDetail')">
    <button
      type="button"
      class="image-card__delete"
      :disabled="deleting"
      :aria-label="t('myImage.deleteAria')"
      @click="emit('delete', $event)"
    >
      <el-icon><Delete /></el-icon>
    </button>
    <div class="image-card__cover">
      <img :src="src" :alt="displayMediaName(item.name)" loading="lazy" />
    </div>
    <h2 class="image-card__title">{{ displayMediaName(item.name) }}</h2>
  </article>
</template>

<style scoped>
.image-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.14);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  color: #5c4a6a;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 34px rgba(200, 140, 180, 0.22);
}

.image-card__delete {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #ff9a9a, #f56c6c);
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
}

.image-card:hover .image-card__delete,
.image-card:focus-within .image-card__delete {
  opacity: 1;
  pointer-events: auto;
}

.image-card__cover {
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 248, 251, 0.95);
}

.image-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}
</style>
