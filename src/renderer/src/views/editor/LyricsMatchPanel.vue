<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MusicScore } from '@deciphony/renderer'
import FloatingPanel from '@renderer/components/FloatingPanel.vue'
import {
  applyGrandStaffLyricsText,
  readGrandStaffLyricsText,
  type LyricsMatchOverflow
} from '@renderer/views/editor/editHelper/lyricsSmartMatch'

/**
 * 歌词智能匹配弹窗：每个复谱表一个输入框，每行（回车换行）对应其中一个单谱表；
 * 输入即按顺序填进音符的第一行歌词，跳过休止符和连音线罩住的音，`_` 空过一个音。
 */
const props = defineProps<{
  musicScore: MusicScore
  anchor?: HTMLElement | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const grandStaffs = computed(() =>
  props.musicScore.grandStaffs.map((gs) => ({ id: gs.id, staffCount: gs.staves.length }))
)

const focusedIndex = ref<number | null>(null)
const draft = ref('')
const overflow = ref<LyricsMatchOverflow | null>(null)

function value(index: number): string {
  return focusedIndex.value === index ? draft.value : readGrandStaffLyricsText(props.musicScore, index)
}

function onFocus(index: number) {
  draft.value = readGrandStaffLyricsText(props.musicScore, index)
  focusedIndex.value = index
  overflow.value = null
}

function onInput(index: number, text: string) {
  draft.value = text
  overflow.value = applyGrandStaffLyricsText(props.musicScore, index, text)
}

function onBlur(index: number) {
  if (focusedIndex.value !== index) return
  focusedIndex.value = null
  overflow.value = null
}

function overflowMessages(index: number): string[] {
  const info = overflow.value
  if (focusedIndex.value !== index || !info) return []
  const messages = info.syllables.flatMap((n, staffIndex) =>
    n > 0 ? [t('editor.lyricsMatch.overflow', { staff: staffIndex + 1, n })] : []
  )
  if (info.lines > 0) messages.push(t('editor.lyricsMatch.extraLines', { n: info.lines }))
  return messages
}
</script>

<template>
  <FloatingPanel
    :title="t('editor.lyricsMatch.title')"
    position-key="lyricsMatch"
    :anchor="anchor"
    @close="emit('close')"
  >
    <div class="lyrics-match">
      <div class="lyrics-match__list">
        <div v-for="(gs, index) in grandStaffs" :key="gs.id" class="lyrics-match__row">
          <span class="lyrics-match__label">{{ t('editor.lyricsMatch.grandStaff', { n: index + 1 }) }}</span>
          <div class="lyrics-match__field">
            <el-input
              :model-value="value(index)"
              type="textarea"
              :autosize="{ minRows: Math.max(1, gs.staffCount), maxRows: Math.max(4, gs.staffCount) }"
              resize="none"
              :placeholder="
                gs.staffCount > 1
                  ? t('editor.lyricsMatch.placeholderMulti', { n: gs.staffCount })
                  : t('editor.lyricsMatch.placeholder')
              "
              @focus="onFocus(index)"
              @input="onInput(index, $event)"
              @blur="onBlur(index)"
            />
            <div v-for="msg in overflowMessages(index)" :key="msg" class="lyrics-match__overflow">
              {{ msg }}
            </div>
          </div>
        </div>
      </div>
      <div class="lyrics-match__hint">{{ t('editor.lyricsMatch.hint') }}</div>
    </div>
  </FloatingPanel>
</template>

<style scoped>
.lyrics-match {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 440px;
  user-select: text;
}

.lyrics-match__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.lyrics-match__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.lyrics-match__label {
  flex: none;
  min-width: 52px;
  line-height: 28px;
  font-size: 12px;
  color: #6b5a78;
}

.lyrics-match__field {
  flex: 1;
  min-width: 0;
}

.lyrics-match__overflow {
  margin-top: 2px;
  font-size: 12px;
  color: #e0566f;
}

.lyrics-match__hint {
  font-size: 12px;
  line-height: 1.5;
  color: #8a7699;
}
</style>
