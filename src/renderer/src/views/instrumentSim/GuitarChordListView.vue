<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chord } from '@deciphony/renderer'
import type { tabChord } from '@deciphony/renderer'
import { ChordBuilder } from '@deciphony/extensions/chord-builder'
import type { ChordBuilderDisabledField } from '@deciphony/extensions/chord-builder'
import BackButton from '@renderer/components/BackButton.vue'
import {
  createEmptyChordForTabType,
  createGuitarChord,
  deleteGuitarChord,
  GUITAR_CHORD_TAB_TYPES,
  listGuitarChords,
  tabTypeStringCount,
  updateGuitarChord,
  type GuitarChordRecord,
  type GuitarChordTabType
} from '@renderer/utils/fileHelper/guitarChordFile'
import {
  cloneFingerPoseMap,
  buildRestFretHandPose,
  buildStoredFretHandPose,
  type FingerPoseMap
} from '@renderer/utils/guitarFingerPose'
import GuitarChordHandDialog from './GuitarChordHandDialog.vue'

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
const tabFilter = ref<GuitarChordTabType | 'all'>('all')
const loading = ref(false)
const chords = ref<GuitarChordRecord[]>([])
const editorVisible = ref(false)
const handVisible = ref(false)
const editingId = ref<number | null>(null)
const editorKey = ref(0)
/** 创建时选定；编辑时只读 */
const draftTabType = ref<GuitarChordTabType>('tab6')
const draftChord = ref<tabChord>(createEmptyChordForTabType('tab6'))
const draftHandPose = ref<FingerPoseMap | null>(null)
const handPoseCustomized = ref(false)

/** 弦数创建后不可改：ChordBuilder.disabled 锁 stringCount */
const chordBuilderDisabled: ChordBuilderDisabledField[] = ['stringCount']

const TAB_TYPE_LABEL_KEYS: Record<GuitarChordTabType, string> = {
  tab4: 'instrumentSim.chords.filterTab4',
  tab5: 'instrumentSim.chords.filterTab5',
  tab6: 'instrumentSim.chords.filterTab6'
}

function tabTypeLabel(type: GuitarChordTabType): string {
  return t(TAB_TYPE_LABEL_KEYS[type])
}

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
  const nameSize = display.nameSize ?? LIST_CHORD_LAYOUT.nameSize
  const textSize = display.textSize ?? LIST_CHORD_LAYOUT.textSize
  const top = nameSize + textSize * 2.2
  const bottom = textSize * 2.2
  const side = textSize * 1.5
  const x = -side
  const y = -top
  const w = display.width + side * 2
  const h = display.height + top + bottom
  return `${x} ${y} ${w} ${h}`
}

async function refresh() {
  loading.value = true
  try {
    chords.value = await listGuitarChords(keyword.value, tabFilter.value)
  } finally {
    loading.value = false
  }
}

function onCreateTabTypeChange(next: GuitarChordTabType) {
  if (editingId.value != null) return
  draftTabType.value = next
  const name = draftChord.value.name ?? ''
  draftChord.value = createEmptyChordForTabType(next, name)
  draftHandPose.value = buildRestFretHandPose()
  handPoseCustomized.value = false
  editorKey.value += 1
}

function openCreate() {
  editingId.value = null
  draftTabType.value = 'tab6'
  draftChord.value = createEmptyChordForTabType('tab6', '')
  draftHandPose.value = buildRestFretHandPose()
  handPoseCustomized.value = false
  editorKey.value += 1
  editorVisible.value = true
}

function openEdit(row: GuitarChordRecord) {
  editingId.value = row.id
  draftTabType.value = row.tabType
  draftChord.value = JSON.parse(JSON.stringify(row.chord)) as tabChord
  draftChord.value.stringCount = tabTypeStringCount(row.tabType)
  if (!Array.isArray(draftChord.value.barres)) draftChord.value.barres = []
  if (!Array.isArray(draftChord.value.stringStates)) {
    draftChord.value.stringStates = createEmptyChordForTabType(row.tabType).stringStates
  }
  draftHandPose.value = row.handPose
    ? cloneFingerPoseMap(row.handPose)
    : buildStoredFretHandPose(draftChord.value)
  handPoseCustomized.value = Boolean(row.handPose)
  editorKey.value += 1
  editorVisible.value = true
}

function onHandConfirm(pose: FingerPoseMap) {
  draftHandPose.value = cloneFingerPoseMap(pose)
  handPoseCustomized.value = true
}

async function save() {
  const name = draftChord.value.name?.trim()
  if (!name) {
    ElMessage.warning(t('instrumentSim.chords.name'))
    return
  }
  draftChord.value.name = name
  draftChord.value.stringCount = tabTypeStringCount(draftTabType.value)
  const pose = handPoseCustomized.value
    ? draftHandPose.value
    : buildStoredFretHandPose(draftChord.value)
  try {
    if (editingId.value == null) {
      await createGuitarChord(draftChord.value, pose, draftTabType.value)
    } else {
      await updateGuitarChord(editingId.value, draftChord.value, pose)
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

watch(tabFilter, () => {
  void refresh()
})

onMounted(() => {
  void refresh()
})
</script>

<template>
  <div class="chord-page">
    <header class="chord-page__header">
      <BackButton fallback="/" />
      <h1 class="chord-page__title">{{ t('instrumentSim.chords.title') }}</h1>
      <el-button type="primary" size="small" @click="openCreate">
        {{ t('instrumentSim.chords.add') }}
      </el-button>
    </header>

    <div class="chord-page__toolbar">
      <el-radio-group v-model="tabFilter" size="small" class="chord-page__filter">
        <el-radio-button label="all">{{ t('instrumentSim.chords.filterAll') }}</el-radio-button>
        <el-radio-button v-for="type in GUITAR_CHORD_TAB_TYPES" :key="type" :label="type">
          {{ tabTypeLabel(type) }}
        </el-radio-button>
      </el-radio-group>
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
          <span class="chord-card__badge">
            {{ tabTypeLabel(row.tabType) }}
          </span>
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
      width="980px"
      top="4vh"
      append-to-body
      destroy-on-close
      class="chord-editor-dialog"
    >
      <div class="chord-editor-type">
        <span class="chord-editor-type__label">{{ t('instrumentSim.chords.typeLabel') }}</span>
        <el-radio-group
          :model-value="draftTabType"
          size="small"
          :disabled="editingId != null"
          @update:model-value="onCreateTabTypeChange($event as GuitarChordTabType)"
        >
          <el-radio-button v-for="type in GUITAR_CHORD_TAB_TYPES" :key="type" :label="type">
            {{ tabTypeLabel(type) }}
          </el-radio-button>
        </el-radio-group>
        <span class="chord-editor-type__tip">{{ t('instrumentSim.chords.typeLocked') }}</span>
      </div>
      <div class="chord-editor-body">
        <ChordBuilder
          v-if="editorVisible"
          :key="editorKey"
          class="chord-editor-body__builder"
          :chord="draftChord"
          :preview-scale="3.2"
          :disabled="chordBuilderDisabled"
        />
        <div class="chord-editor-body__side">
          <el-button type="primary" plain @click="handVisible = true">
            {{ t('instrumentSim.chords.hand') }}
          </el-button>
          <p v-if="draftHandPose" class="chord-editor-body__pose-tip">
            {{ t('instrumentSim.chords.handSaved') }}
          </p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="save">{{ t('instrumentSim.chords.save') }}</el-button>
      </template>
    </el-dialog>

    <GuitarChordHandDialog
      v-model="handVisible"
      :chord="draftChord"
      :hand-pose="draftHandPose"
      @confirm="onHandConfirm"
    />
  </div>
</template>

<style scoped>
.chord-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.chord-page__header {
  flex-shrink: 0;
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
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 16px 20px 0;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.chord-page__filter {
  flex: 0 0 auto;
}

.chord-page__search {
  flex: 1;
  min-width: 160px;
}

.chord-page__main {
  flex: 1;
  min-height: 0;
  overflow: auto;
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

.chord-card__badge {
  font-size: 11px;
  font-weight: 600;
  color: #7a6a88;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(201, 184, 255, 0.28);
}

.chord-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.chord-editor-type {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.chord-editor-type__label {
  font-size: 13px;
  font-weight: 600;
  color: #5c4a6a;
}

.chord-editor-type__tip {
  font-size: 12px;
  color: #9a8aa8;
}

.chord-editor-body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.chord-editor-body__builder {
  flex: 1;
  min-width: 0;
}

.chord-editor-body__side {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding-top: 8px;
}

.chord-editor-body__pose-tip {
  margin: 0;
  font-size: 12px;
  color: #7a6a88;
  max-width: 96px;
  line-height: 1.4;
}
</style>
