<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chord } from '@deciphony/renderer'
import type { tabChord } from '@deciphony/renderer'
import type { GuitarChordRecord } from '@renderer/utils/fileHelper/guitarChordFile'
import {
  emptyGuitarShortcuts,
  loadGuitarShortcuts,
  saveGuitarShortcuts,
  type GuitarShortcutMap
} from '@renderer/utils/guitarShortcuts'

const CARD_LAYOUT = {
  width: 72,
  height: 92,
  textSize: 10,
  nameSize: 12
} as const

const props = defineProps<{
  chords: GuitarChordRecord[]
}>()

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  saved: []
}>()

const { t } = useI18n()
const draft = ref<GuitarShortcutMap>(emptyGuitarShortcuts())

const chordById = computed(() => {
  const map = new Map<number, GuitarChordRecord>()
  for (const c of props.chords) map.set(c.id, c)
  return map
})

watch(visible, (open) => {
  if (open) draft.value = loadGuitarShortcuts()
})

function getBound(n: number): GuitarChordRecord | null {
  const id = draft.value[String(n)]
  if (id == null) return null
  return chordById.value.get(id) ?? null
}

function toCardChord(chord: tabChord): tabChord {
  return {
    ...chord,
    width: CARD_LAYOUT.width,
    height: CARD_LAYOUT.height,
    textSize: CARD_LAYOUT.textSize,
    nameSize: CARD_LAYOUT.nameSize
  }
}

function cardViewBox(chord: tabChord): string {
  const display = toCardChord(chord)
  const top = display.nameSize + display.textSize * 2.2
  const bottom = display.textSize * 2.2
  const side = display.textSize * 1.5
  return `${-side} ${-top} ${display.width + side * 2} ${display.height + top + bottom}`
}

function save() {
  saveGuitarShortcuts(draft.value)
  ElMessage.success(t('instrumentSim.shortcuts.saved'))
  emit('saved')
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('instrumentSim.shortcuts.title')"
    width="960px"
    top="8vh"
    destroy-on-close
  >
    <div class="shortcut-row">
      <div v-for="n in 9" :key="n" class="shortcut-cell">
        <span class="shortcut-cell__key">{{ t('instrumentSim.shortcuts.key', { n }) }}</span>
        <el-select
          v-model="draft[String(n)]"
          clearable
          filterable
          size="small"
          class="shortcut-cell__select"
          :placeholder="t('instrumentSim.shortcuts.unbound')"
        >
          <el-option
            v-for="chord in props.chords"
            :key="chord.id"
            :label="chord.name"
            :value="chord.id"
          />
        </el-select>
        <div class="shortcut-cell__card">
          <template v-if="getBound(n)">
            <svg
              class="shortcut-cell__svg"
              :viewBox="cardViewBox(getBound(n)!.chord)"
              overflow="visible"
            >
              <Chord :chord="toCardChord(getBound(n)!.chord)" />
            </svg>
          </template>
          <span v-else class="shortcut-cell__empty">{{ t('instrumentSim.shortcuts.unbound') }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="save">{{ t('instrumentSim.shortcuts.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.shortcut-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.shortcut-cell {
  flex: 1 0 96px;
  min-width: 96px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.shortcut-cell__key {
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
  text-align: center;
}

.shortcut-cell__select {
  width: 100%;
}

.shortcut-cell__card {
  min-height: 132px;
  border-radius: 12px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  box-sizing: border-box;
}

.shortcut-cell__svg {
  width: 100%;
  max-height: 120px;
  display: block;
  overflow: visible;
}

.shortcut-cell__empty {
  font-size: 12px;
  color: #a090b0;
}
</style>
