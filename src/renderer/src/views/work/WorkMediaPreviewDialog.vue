<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'WorkMediaPreviewDialog' })

const props = defineProps<{
  modelValue: boolean
  kind: 'image' | 'video'
  src: string
  title?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
  }
)
</script>

<template>
  <el-dialog
    v-model="open"
    class="work-media-preview"
    :title="title || t('work.menu.mediaPreview')"
    width="min(920px, 92vw)"
    align-center
    destroy-on-close
  >
    <div class="work-media-preview__body">
      <img v-if="kind === 'image' && src" class="work-media-preview__media" :src="src" alt="" />
      <video
        v-else-if="kind === 'video' && src"
        class="work-media-preview__media"
        :src="src"
        controls
        autoplay
      />
    </div>
  </el-dialog>
</template>

<style scoped>
.work-media-preview__body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  max-height: min(78vh, 820px);
  overflow: auto;
  background: #12121a;
  border-radius: 8px;
}

.work-media-preview__media {
  display: block;
  max-width: 100%;
  max-height: min(78vh, 820px);
  object-fit: contain;
}
</style>
