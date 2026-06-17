<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePlayStore } from '@renderer/store/play.store'
import {
  fetchOwnedToneColorOptions,
  type ToneColorOption
} from '@renderer/utils/collection/toneColorUsage'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  { disabled: false },
)

const playStore = usePlayStore()
const { collectionToneColorId, collectionToneColorLoading } = storeToRefs(playStore)

const activePanel = ref(false)
const options = ref<ToneColorOption[]>([])
const optionsLoading = ref(false)

const toneColorLabel = computed(() => {
  const current = options.value.find((item) => item.id === collectionToneColorId.value)
  return current?.name ?? '音色'
})

const panelLoading = computed(() => optionsLoading.value || collectionToneColorLoading.value)
const buttonDisabled = computed(() => props.disabled || panelLoading.value)

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) activePanel.value = false
  },
)

function togglePanel() {
  if (buttonDisabled.value) return
  activePanel.value = !activePanel.value
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-toolbar__adjuster--tone-color')) {
    activePanel.value = false
  }
}

onMounted(async () => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  optionsLoading.value = true
  try {
    options.value = await fetchOwnedToneColorOptions()
    await playStore.ensureCollectionToneColorInitialized()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '音色加载失败')
  } finally {
    optionsLoading.value = false
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

async function onToneColorChange(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value)
  if (!Number.isFinite(id) || id === collectionToneColorId.value) return

  try {
    await playStore.setCollectionToneColor(id)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '音色切换失败')
  }
}
</script>

<template>
  <div class="score-toolbar__adjuster score-toolbar__adjuster--tone-color">
    <button
      type="button"
      class="score-toolbar__btn score-toolbar__btn--stable"
      :disabled="buttonDisabled"
      @click="togglePanel"
    >
      音色 {{ toneColorLabel }}
    </button>
    <div
      v-if="activePanel"
      v-loading="panelLoading"
      class="score-toolbar__popup score-tone-color__popup"
      @pointerdown.stop
    >
      <div class="score-tone-color__field">
        <span class="score-tone-color__field-label">音色</span>
        <select
          class="score-tone-color__select"
          :value="collectionToneColorId"
          :disabled="buttonDisabled || options.length === 0"
          @change="onToneColorChange"
        >
          <option v-for="item in options" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.score-toolbar__adjuster {
  position: relative;
}

.score-toolbar__popup {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  z-index: 40;
  padding: 12px 14px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 248, 251, 0.98);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.22);
  transform: translateX(-50%);
}

.score-toolbar__btn--stable {
  min-width: 108px;
}

.score-tone-color__popup {
  min-width: 180px;
}

.score-tone-color__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-tone-color__field-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.score-tone-color__select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 8px;
  background: #fff;
  color: #5c4a6a;
  font-size: 13px;
}

.score-tone-color__select:focus {
  outline: none;
  border-color: #ff8fba;
}

.score-tone-color__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
