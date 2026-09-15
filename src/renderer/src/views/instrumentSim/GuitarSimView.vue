<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import musicScoreVue from '@deciphony/renderer'
import type { MusicScore } from '@deciphony/renderer'
import BackButton from '@renderer/components/BackButton.vue'
import {
  NYLON_GUITAR_COLLECTION_ID,
  midiForStringFret,
  stringNumberToFretIndex,
  tabChordToFrets
} from '@renderer/constant/guitar'
import { listGuitarChords, type GuitarChordRecord } from '@renderer/utils/fileHelper/guitarChordFile'
import { searchScoresFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper/scoreFile'
import { loadGuitarShortcuts } from '@renderer/utils/guitarShortcuts'
import { usePlayStore } from '@renderer/store/play.store'
import { useScorePagePlayback } from '@renderer/utils/scorePagePlayback/useScorePagePlayback'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import emptyScore from '@renderer/template/empty'
import GuitarPanel from './GuitarPanel.vue'
import GuitarShortcutDialog from './GuitarShortcutDialog.vue'

defineOptions({ name: 'GuitarSimView' })

const { t } = useI18n()
const router = useRouter()
const playStore = usePlayStore()
const { waitScoreSkin } = useScoreSkin()

const guideVisible = ref(false)
const shortcutVisible = ref(false)
const chords = ref<GuitarChordRecord[]>([])
const shortcuts = ref(loadGuitarShortcuts())
const scoreOptions = ref<Array<{ id: number; name: string }>>([])
const selectedScoreId = ref<number | null>(null)
const musicScore = ref<MusicScore>(JSON.parse(JSON.stringify(emptyScore)) as MusicScore)
const musicScoreRef = ref<{
  findElementByVDom: (node: unknown) => SVGElement | null
} | null>(null)

const activeChord = ref<GuitarChordRecord | null>(null)
const activeString = ref<number | null>(null)

const frets = computed(() =>
  activeChord.value ? tabChordToFrets(activeChord.value.chord) : [-1, -1, -1, -1, -1, -1]
)

const scorePlayback = useScorePagePlayback(musicScore, {
  musicScoreRef
})

async function refreshChords() {
  chords.value = await listGuitarChords()
}

async function refreshScores() {
  const list = await searchScoresFromDatabase('')
  scoreOptions.value = list.map((s) => ({ id: s.id, name: s.name }))
}

async function onScoreChange(id: number | null) {
  selectedScoreId.value = id
  scorePlayback.handleStop()
  if (id == null) {
    musicScore.value = JSON.parse(JSON.stringify(emptyScore)) as MusicScore
    return
  }
  const res = await window.api.score.get(id)
  if (!res.success || !res.data?.data) {
    ElMessage.error(t('editor.messages.scoreLoadFailed'))
    return
  }
  musicScore.value = parseScoreJson(res.data.data)
  await playStore.restorePlaybackDefaults(musicScore.value)
}

function applyChordByShortcut(digit: string) {
  const chordId = shortcuts.value[digit]
  if (chordId == null) return
  const chord = chords.value.find((c) => c.id === chordId)
  if (!chord) return
  activeChord.value = chord
}

async function pickString(stringNumber: number) {
  activeString.value = stringNumber
  const fretIndex = stringNumberToFretIndex(stringNumber)
  const fret = frets.value[fretIndex] ?? -1

  if (fret < 0) {
    window.setTimeout(() => {
      if (activeString.value === stringNumber) activeString.value = null
    }, 220)
    return
  }
  const midi = midiForStringFret(stringNumber, fret)
  if (midi == null) return
  await playStore.triggerNote(midi, { duration: 1.2 })

  window.setTimeout(() => {
    if (activeString.value === stringNumber) activeString.value = null
  }, 220)
}

function onKeyDown(ev: KeyboardEvent) {
  const target = ev.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

  if (ev.code.startsWith('Digit') && !ev.code.includes('Numpad')) {
    const digit = ev.code.replace('Digit', '')
    if (digit >= '1' && digit <= '9') {
      ev.preventDefault()
      applyChordByShortcut(digit)
    }
    return
  }

  if (ev.code.startsWith('Numpad')) {
    const digit = ev.code.replace('Numpad', '')
    if (digit >= '1' && digit <= '6') {
      ev.preventDefault()
      void pickString(Number(digit))
    }
  }
}

function openChordManage() {
  router.push({ name: 'guitarChordManage' })
}

function onShortcutsSaved() {
  shortcuts.value = loadGuitarShortcuts()
  shortcutVisible.value = false
}

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  const toneTask = (async () => {
    await playStore.init()
    await playStore.setCollectionToneColor(NYLON_GUITAR_COLLECTION_ID)
  })()
  try {
    await Promise.all([waitScoreSkin(), refreshChords(), refreshScores(), toneTask])
  } catch {
    ElMessage.warning(t('instrumentSim.locked'))
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  scorePlayback.handleStop()
  playStore.releaseAllHeldNotes()
})

watch(shortcutVisible, (open) => {
  if (!open) shortcuts.value = loadGuitarShortcuts()
})
</script>

<template>
  <div class="guitar-sim">
    <header class="guitar-sim__header">
      <BackButton fallback="/instrument-sim" />
      <h1 class="guitar-sim__title">{{ t('instrumentSim.guitar.title') }}</h1>
      <el-button size="small" @click="guideVisible = true">{{ t('instrumentSim.guide') }}</el-button>
    </header>

    <div class="guitar-sim__body">
      <aside class="guitar-sim__left">
        <section class="guitar-sim__panel guitar-sim__panel--tools">
          <div class="guitar-sim__row">
            <span class="guitar-sim__label">{{ t('instrumentSim.guitar.selectScore') }}</span>
            <el-select
              :model-value="selectedScoreId"
              clearable
              filterable
              class="guitar-sim__score-select"
              :placeholder="t('instrumentSim.guitar.noScore')"
              @update:model-value="onScoreChange"
            >
              <el-option
                v-for="item in scoreOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>

          <div class="guitar-sim__row guitar-sim__row--btns">
            <el-button
              type="primary"
              size="small"
              :disabled="scorePlayback.playDisabled.value || !selectedScoreId"
              @click="scorePlayback.handlePlay()"
            >
              {{ t('instrumentSim.guitar.play') }}
            </el-button>
            <el-button
              size="small"
              :disabled="scorePlayback.pauseDisabled.value"
              @click="scorePlayback.handlePause()"
            >
              {{ t('instrumentSim.guitar.pause') }}
            </el-button>
            <el-button
              size="small"
              :disabled="scorePlayback.stopDisabled.value"
              @click="scorePlayback.handleStop()"
            >
              {{ t('instrumentSim.guitar.stop') }}
            </el-button>
          </div>

          <div class="guitar-sim__row guitar-sim__row--btns">
            <el-button size="small" @click="shortcutVisible = true">
              {{ t('instrumentSim.guitar.shortcutSettings') }}
            </el-button>
            <el-button size="small" @click="openChordManage">
              {{ t('instrumentSim.guitar.manageChords') }}
            </el-button>
          </div>

          <p class="guitar-sim__meta">
            {{ t('instrumentSim.guitar.currentChord') }}：
            {{ activeChord?.name || t('instrumentSim.guitar.none') }}
          </p>
          <p class="guitar-sim__hint">{{ t('instrumentSim.guitar.toneLocked') }}</p>
          <p class="guitar-sim__hint">{{ t('instrumentSim.guitar.chordHint') }}</p>
          <p class="guitar-sim__hint">{{ t('instrumentSim.guitar.pickHint') }}</p>
        </section>

        <section class="guitar-sim__panel guitar-sim__panel--score">
          <div class="guitar-sim__score-scroll">
            <musicScoreVue ref="musicScoreRef" :data="musicScore" />
          </div>
        </section>
      </aside>

      <section class="guitar-sim__right">
        <GuitarPanel
          :chord="activeChord?.chord ?? null"
          :active-string="activeString"
          @pick="pickString"
        />
      </section>
    </div>

    <el-dialog v-model="guideVisible" :title="t('instrumentSim.guitar.guideTitle')" width="480px">
      <p class="guitar-sim__guide">{{ t('instrumentSim.guitar.guideBody') }}</p>
    </el-dialog>

    <GuitarShortcutDialog
      v-model="shortcutVisible"
      :chords="chords"
      @saved="onShortcutsSaved"
    />
  </div>
</template>

<style scoped>
.guitar-sim {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fff8f2 0%, #f3ebff 50%, #eaf4ff 100%);
  box-sizing: border-box;
}

.guitar-sim__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.9);
  flex-shrink: 0;
}

.guitar-sim__title {
  margin: 0;
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #5c4a6a;
}

.guitar-sim__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(160px, 220px);
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
}

.guitar-sim__left {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guitar-sim__panel {
  border-radius: 16px;
  border: 1px solid rgba(255, 184, 208, 0.4);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(180, 140, 170, 0.12);
}

.guitar-sim__panel--tools {
  flex-shrink: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guitar-sim__panel--score {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.guitar-sim__score-scroll {
  height: 100%;
  overflow: auto;
  padding: 8px;
  box-sizing: border-box;
}

.guitar-sim__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guitar-sim__row--btns {
  flex-wrap: wrap;
}

.guitar-sim__label {
  flex-shrink: 0;
  font-size: 12px;
  color: #7a6a88;
}

.guitar-sim__score-select {
  flex: 1;
  min-width: 0;
}

.guitar-sim__meta {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #5c4a6a;
}

.guitar-sim__hint {
  margin: 0;
  font-size: 12px;
  color: #8a7a98;
  line-height: 1.4;
}

.guitar-sim__right {
  min-width: 0;
  min-height: 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.55);
  padding: 8px;
  box-sizing: border-box;
}

.guitar-sim__guide {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #5c4a6a;
}
</style>
