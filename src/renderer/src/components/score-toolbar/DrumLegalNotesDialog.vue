<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VideoPlay } from '@element-plus/icons-vue'
import musicScoreVue from '@deciphony/renderer'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import {
  drumLegalNoteDisplayName,
  listDrumLegalNotes,
  type DrumLegalNoteEntry
} from '@renderer/utils/drumLegalNotes'
import { usePlayStore } from '@renderer/store/play.store'
import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'
import { toneColorKey } from '@renderer/utils/collection/toneColorUsage'
import { PLAY_DEFAULT_BPM } from '@renderer/constant/play'

defineOptions({ name: 'DrumLegalNotesDialog' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t, locale } = useI18n()
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()
const playStore = usePlayStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const notes = ref<DrumLegalNoteEntry[]>([])
const playingKey = ref<string | null>(null)

const drumToneColor = toneColorKey(BUILTIN_COLLECTION_SEED_IDS.toneColor.打击乐)

watch(
  () => props.modelValue,
  (open) => {
    if (open && notes.value.length === 0) {
      notes.value = listDrumLegalNotes()
    }
    if (!open) playingKey.value = null
  },
  { immediate: true }
)

/** 当前 BPM 下八分音符时长（秒） */
function eighthNoteDurationSec(): number {
  const bpm = playStore.bpm || PLAY_DEFAULT_BPM
  return 60 / Math.max(1, bpm) / 2
}

async function previewNote(item: DrumLegalNoteEntry) {
  if (playingKey.value === item.key) return
  playingKey.value = item.key
  try {
    const mapVolume = item.volume ?? 1
    await playStore.triggerNote(item.midi, {
      id: `drum-legal-${item.key}`,
      toneColor: drumToneColor,
      duration: eighthNoteDurationSec(),
      volume: playStore.volume * mapVolume
    })
  } finally {
    window.setTimeout(() => {
      if (playingKey.value === item.key) playingKey.value = null
    }, Math.max(80, eighthNoteDurationSec() * 1000))
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.drumLegalNotes.title')"
    width="92vw"
    top="4vh"
    class="drum-legal-notes-dialog cute-dialog"
    append-to-body
    destroy-on-close
  >
    <p class="drum-legal-notes-dialog__lead">
      {{ t('editor.drumLegalNotes.lead') }}
    </p>
    <div class="drum-legal-notes-dialog__grid">
      <article v-for="item in notes" :key="item.key" class="drum-legal-notes-dialog__card">
        <div class="drum-legal-notes-dialog__score">
          <musicScoreVue
            v-if="scoreSkin"
            :key="`${scoreSkinName}-${item.key}`"
            :data="item.score"
            :skin="scoreSkin"
            :skin-name="scoreSkinName"
          />
        </div>
        <div class="drum-legal-notes-dialog__meta">
          <h3 class="drum-legal-notes-dialog__name">
            <kbd
              v-if="item.shortcut"
              class="drum-legal-notes-dialog__key"
              :title="t('editor.drumLegalNotes.shortcut', { key: item.shortcut.toUpperCase() })"
            >
              {{ item.shortcut.toUpperCase() }}
            </kbd>
            {{ drumLegalNoteDisplayName(item.label, locale) }}
          </h3>
          <p class="drum-legal-notes-dialog__hint">
            {{
              t('editor.drumLegalNotes.meta', {
                region: item.region,
                headType: item.headType
              })
            }}
          </p>
        </div>
        <button
          type="button"
          class="drum-legal-notes-dialog__play"
          :class="{ 'is-playing': playingKey === item.key }"
          :title="t('editor.drumLegalNotes.play')"
          :aria-label="t('editor.drumLegalNotes.play')"
          @click.stop="previewNote(item)"
        >
          <el-icon :size="14"><VideoPlay /></el-icon>
        </button>
      </article>
    </div>
  </el-dialog>
</template>

<style scoped>
.drum-legal-notes-dialog__lead {
  margin: 0 0 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.drum-legal-notes-dialog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  max-height: calc(92vh - 120px);
  overflow: auto;
  padding: 2px 4px 8px;
}

.drum-legal-notes-dialog__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 10px 12px;
  border: 1px solid color-mix(in srgb, var(--el-border-color) 80%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--el-fill-color-blank) 92%, var(--el-color-primary) 8%);
}

.drum-legal-notes-dialog__score {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--el-bg-color);
}

.drum-legal-notes-dialog__score :deep(svg) {
  max-width: 100%;
  height: auto;
}

.drum-legal-notes-dialog__meta {
  padding: 0 2px;
  padding-right: 36px;
}

.drum-legal-notes-dialog__name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--el-text-color-primary);
}

.drum-legal-notes-dialog__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  margin-right: 6px;
  padding: 0 5px;
  vertical-align: 2px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-color-primary);
  background: var(--el-bg-color);
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 45%, transparent);
  border-bottom-width: 2px;
  border-radius: 6px;
}

.drum-legal-notes-dialog__hint {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

.drum-legal-notes-dialog__play {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--el-border-color) 70%, transparent);
  border-radius: 999px;
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.drum-legal-notes-dialog__play:hover {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 12%, var(--el-bg-color));
}

.drum-legal-notes-dialog__play.is-playing {
  border-color: var(--el-color-primary);
  color: #fff;
  background: var(--el-color-primary);
}
</style>

<style>
.drum-legal-notes-dialog.el-dialog {
  max-width: 1400px;
  border-radius: 16px;
}

.drum-legal-notes-dialog .el-dialog__body {
  padding-top: 8px;
  padding-bottom: 16px;
}
</style>
