<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chord } from '@deciphony/renderer'
import type { tabChord } from '@deciphony/renderer'
import { ChordBuilder, createEmptyChord } from '@deciphony/extensions/chord-builder'
import BackButton from '@renderer/components/BackButton.vue'
import {
  createGuitarChord,
  deleteGuitarChord,
  listGuitarChords,
  updateGuitarChord,
  type GuitarChordRecord
} from '@renderer/utils/fileHelper/guitarChordFile'

defineOptions({ name: 'GuitarChordListView' })

/** 列表展示用尺寸：放大框体、缩小标题，避免 name 裁切 */
const LIST_CHORD_LAYOUT = {
  width: 96,
  height: 120,
  textSize: 12,
  nameSize: 16
} as const

const { t } = useI18n()

const keyword = ref('')
const loading = ref(false)
const chords = ref<GuitarChordRecord[]>([])
const editorVisible = ref(false)
const editingId = ref<number | null>(null)
const editorKey = ref(0)
const draftChord = ref<tabChord>(createEmptyChord({ name: '' }))

function toListChord(chord: tabChord): tabChord {
  return {
    ...chord,
    width: LIST_CHORD_LAYOUT.width,
    height: LIST_CHORD_LAYOUT.height,
    textSize: LIST_CHORD_LAYOUT.textSize,
    nameSize: LIST_CHORD_LAYOUT.nameSize
  }
}

function listChordViewBoxAttr(chord: tabChord): string {
  const display = toListChord(chord)
  const top = display.nameSize + display.textSize * 2.2
  const bottom = display.textSize * 2.2
  const side = display.textSize * 1.5
  const x = -side
  const y = -top
  const w = display.width + side * 2
  const h = display.height + top + bottom
  return `${x} ${y} ${w} ${h}`
}

async function refresh() {
  loading.value = true
  try {
    chords.value = await listGuitarChords(keyword.value)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  draftChord.value = createEmptyChord({ name: '' })
  editorKey.value += 1
  editorVisible.value = true
}

function openEdit(row: GuitarChordRecord) {
  editingId.value = row.id
  draftChord.value = JSON.parse(JSON.stringify(row.chord)) as tabChord
  if (!Array.isArray(draftChord.value.barres)) draftChord.value.barres = []
  if (!Array.isArray(draftChord.value.stringStates)) {
    draftChord.value.stringStates = createEmptyChord().stringStates
  }
  editorKey.value += 1
  editorVisible.value = true
}

async function save() {
  const name = draftChord.value.name?.trim()
  if (!name) {
    ElMessage.warning(t('instrumentSim.chords.name'))
    return
  }
  draftChord.value.name = name
  try {
    if (editingId.value == null) {
      await createGuitarChord(draftChord.value)
    } else {
      await updateGuitarChord(editingId.value, draftChord.value)
    }
    ElMessage.success(t('instrumentSim.chords.saved'))
    editorVisible.value = false
    await refresh()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : String(error))
  }
}

async function remove(row: GuitarChordRecord, ev?: Event) {
  ev?.stopPropagation()
  try {
    await ElMessageBox.confirm(
      t('instrumentSim.chords.deleteConfirm', { name: row.name }),
      t('instrumentSim.chords.delete'),
      { type: 'warning' }
    )
    await deleteGuitarChord(row.id)
    ElMessage.success(t('instrumentSim.chords.deleted'))
    await refresh()
  } catch {
    /* cancel */
  }
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <div class="chord-page">
    <header class="chord-page__header">
      <BackButton fallback="/instrument-sim/guitar" />
      <h1 class="chord-page__title">{{ t('instrumentSim.chords.title') }}</h1>
      <el-button type="primary" size="small" @click="openCreate">
        {{ t('instrumentSim.chords.add') }}
      </el-button>
    </header>

    <div class="chord-page__toolbar">
      <el-input
        v-model="keyword"
        clearable
        :placeholder="t('instrumentSim.chords.search')"
        class="chord-page__search"
        @keyup.enter="refresh"
        @clear="refresh"
      />
      <el-button size="small" @click="refresh">{{ t('instrumentSim.chords.search') }}</el-button>
    </div>

    <main v-loading="loading" class="chord-page__main">
      <el-empty v-if="!loading && chords.length === 0" :description="t('instrumentSim.chords.empty')" />
      <div v-else class="chord-grid">
        <article
          v-for="row in chords"
          :key="row.id"
          class="chord-card"
          role="button"
          tabindex="0"
          @click="openEdit(row)"
          @keydown.enter.prevent="openEdit(row)"
        >
          <div class="chord-card__diagram">
            <svg
              class="chord-card__svg"
              :viewBox="listChordViewBoxAttr(row.chord)"
              overflow="visible"
            >
              <Chord :chord="toListChord(row.chord)" />
            </svg>
          </div>
          <h2 class="chord-card__name">{{ row.name }}</h2>
          <div class="chord-card__actions" @click.stop>
            <el-button size="small" @click="openEdit(row)">{{ t('instrumentSim.chords.edit') }}</el-button>
            <el-button size="small" type="danger" plain @click="remove(row, $event)">
              {{ t('instrumentSim.chords.delete') }}
            </el-button>
          </div>
        </article>
      </div>
    </main>

    <el-dialog
      v-model="editorVisible"
      :title="editingId == null ? t('instrumentSim.chords.add') : t('instrumentSim.chords.edit')"
      width="920px"
      top="4vh"
      append-to-body
      destroy-on-close
      class="chord-editor-dialog"
    >
      <ChordBuilder
        v-if="editorVisible"
        :key="editorKey"
        :chord="draftChord"
        :preview-scale="3.2"
      />
      <template #footer>
        <el-button type="primary" @click="save">{{ t('instrumentSim.chords.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.chord-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.chord-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.chord-page__title {
  margin: 0;
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.chord-page__toolbar {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.chord-page__search {
  flex: 1;
}

.chord-page__main {
  flex: 1;
  padding: 16px 20px 24px;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.chord-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.chord-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 24px rgba(180, 140, 170, 0.12);
  cursor: pointer;
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.chord-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(180, 140, 170, 0.2);
}

.chord-card__diagram {
  width: 100%;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chord-card__svg {
  width: 100%;
  height: 100%;
  max-width: 140px;
  display: block;
  overflow: visible;
}

.chord-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #5c4a6a;
}

.chord-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
</style>
