<script setup lang="ts">
import type { MusicScore, SingleStaff } from '@deciphony/renderer'
import { readStaffInstrumentValue, writeStaffInstrumentValue } from '@deciphony/extensions/dr-play'
import { writeInstrumentName } from '@deciphony/extensions/dr-instrument-name'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAppLocale } from '@renderer/i18n/locale'
import {
  findToneColorCatalogItem,
  TONE_COLOR_CATALOG,
  toneColorFamilyName
} from '@renderer/constant/toneColorCatalog'
import {
  fetchOwnedToneColorOptions,
  type ToneColorOption
} from '@renderer/utils/collection/toneColorUsage'
import { sameRowStavesFrom } from './staffRow'

defineOptions({ name: 'StaffToneColorDialog' })

/** 目标单谱表；置 null 关闭弹窗 */
const staff = defineModel<SingleStaff | null>({ required: true })
const props = defineProps<{ musicScore: MusicScore }>()

const { t, locale } = useI18n()
const options = ref<ToneColorOption[]>([])
const loading = ref(false)
const keyword = ref('')
const selectedKey = ref<string | undefined>()

const visible = computed({
  get: () => staff.value != null,
  set: (open: boolean) => {
    if (!open) staff.value = null
  }
})

type ToneColorGroup = { family: string; label: string; items: ToneColorOption[] }

const OTHER_FAMILY = '__other__'
const familyOrder = Object.keys(TONE_COLOR_CATALOG.families)

const groups = computed<ToneColorGroup[]>(() => {
  const appLocale = resolveAppLocale(locale.value)
  const word = keyword.value.trim().toLowerCase()
  const byFamily = new Map<string, ToneColorOption[]>()
  for (const option of options.value) {
    if (word && !option.name.toLowerCase().includes(word) && !option.key.includes(word)) continue
    const family = findToneColorCatalogItem(option.id)?.family ?? OTHER_FAMILY
    const list = byFamily.get(family) ?? []
    list.push(option)
    byFamily.set(family, list)
  }
  return [...familyOrder, OTHER_FAMILY]
    .filter((family) => byFamily.has(family))
    .map((family) => ({
      family,
      label:
        family === OTHER_FAMILY
          ? t('editor.toneColorDialog.otherFamily')
          : toneColorFamilyName(family, appLocale),
      items: byFamily.get(family)!
    }))
})

watch(
  staff,
  async (target) => {
    if (!target) return
    keyword.value = ''
    selectedKey.value = readStaffInstrumentValue(target)
    if (options.value.length) return
    loading.value = true
    try {
      options.value = await fetchOwnedToneColorOptions()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : t('play.toneColor.loadFailed'))
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

function applyToneColor(option: ToneColorOption | undefined) {
  const target = staff.value
  if (!target) return
  for (const item of sameRowStavesFrom(props.musicScore, target)) {
    writeStaffInstrumentValue(item, option?.key)
    writeInstrumentName(item, option?.name)
  }
  staff.value = null
}

function confirm() {
  applyToneColor(options.value.find((item) => item.key === selectedKey.value))
}

function clearToneColor() {
  applyToneColor(undefined)
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.toneColorDialog.title')"
    width="560px"
    class="staff-tone-color-dialog cute-dialog"
    append-to-body
    align-center
  >
    <p class="staff-tone-color-dialog__hint">{{ t('editor.toneColorDialog.hint') }}</p>
    <el-input
      v-model="keyword"
      class="staff-tone-color-dialog__search"
      size="small"
      clearable
      :placeholder="t('editor.toneColorDialog.search')"
    />
    <div v-loading="loading" class="staff-tone-color-dialog__list">
      <section v-for="group in groups" :key="group.family" class="staff-tone-color-dialog__group">
        <h4 class="staff-tone-color-dialog__family">{{ group.label }}</h4>
        <div class="staff-tone-color-dialog__items">
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="staff-tone-color-dialog__item"
            :class="{ 'staff-tone-color-dialog__item--active': item.key === selectedKey }"
            @click="selectedKey = item.key"
          >
            {{ item.name }}
          </button>
        </div>
      </section>
      <p v-if="!loading && groups.length === 0" class="staff-tone-color-dialog__empty">
        {{ t('editor.toneColorDialog.empty') }}
      </p>
    </div>

    <template #footer>
      <button type="button" class="staff-tone-color-dialog__btn" @click="clearToneColor">
        {{ t('editor.toneColorDialog.clear') }}
      </button>
      <button
        type="button"
        class="staff-tone-color-dialog__btn staff-tone-color-dialog__btn--primary"
        :disabled="!selectedKey"
        @click="confirm"
      >
        {{ t('editor.toneColorDialog.confirm') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.staff-tone-color-dialog__hint {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}

.staff-tone-color-dialog__search {
  margin-bottom: 10px;
}

.staff-tone-color-dialog__list {
  max-height: 52vh;
  min-height: 120px;
  overflow-y: auto;
  padding-right: 4px;
}

.staff-tone-color-dialog__group + .staff-tone-color-dialog__group {
  margin-top: 10px;
}

.staff-tone-color-dialog__family {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 800;
  color: #8a5a72;
}

.staff-tone-color-dialog__items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.staff-tone-color-dialog__item {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  background: rgba(255, 255, 255, 0.9);
  color: #5c4a6a;
  font-size: 12px;
  cursor: pointer;
}

.staff-tone-color-dialog__item:hover {
  border-color: #ff8fba;
}

.staff-tone-color-dialog__item--active {
  border-color: #ff8fba;
  background: linear-gradient(135deg, rgba(255, 214, 232, 0.95), rgba(230, 220, 255, 0.95));
  font-weight: 700;
}

.staff-tone-color-dialog__empty {
  margin: 24px 0;
  text-align: center;
  font-size: 12px;
  color: #9a8aa8;
}

.staff-tone-color-dialog__btn {
  margin-left: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.85);
  color: #8a5a72;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.staff-tone-color-dialog__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.staff-tone-color-dialog__btn--primary {
  border-color: rgba(201, 184, 255, 0.65);
  background: linear-gradient(135deg, rgba(255, 214, 232, 0.95), rgba(230, 220, 255, 0.95));
  color: #5c4a6a;
}
</style>

<style>
.staff-tone-color-dialog.cute-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 250, 252, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 12px 40px rgba(120, 90, 140, 0.18);
}

.staff-tone-color-dialog.cute-dialog .el-dialog__title {
  font-weight: 800;
  color: #5c4a6a;
}
</style>
