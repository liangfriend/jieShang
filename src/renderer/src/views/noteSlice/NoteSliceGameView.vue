<script lang="ts" setup>
import musicScoreVue from 'deciphony-renderer'
import type { MusicScore } from 'deciphony-renderer'
import { KeySignatureTypeEnum, ClefTypeEnum } from 'deciphony-renderer'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import {
  generateRandomMidiBrickScore,
  MIDI_BRICK_MIDI_MAX,
  MIDI_BRICK_MIDI_MIN,
  type GeneratedMidiBrick
} from '@renderer/views/noteSlice/midiBrickBuilder'

const route = useRoute()
const title = computed(() => (route.meta.title as string) ?? '音符切切')

const midiInput = ref(60)
const brick = ref<GeneratedMidiBrick | null>(null)
const musicScoreData = ref<MusicScore | null>(null)
const scoreRenderKey = ref(0)
const generateError = ref('')

const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

const metaText = computed(() => {
  if (!brick.value) return ''
  const { midi, clef, keySignature, region, accidental } = brick.value
  const accidentalLabel = accidental ?? 'none'
  return `midi ${midi} · clef ${clef} · key ${keySignature} · region ${region} · accidental ${accidentalLabel}`
})

function handleGenerate() {
  generateError.value = ''
  try {
    const generated = generateRandomMidiBrickScore(midiInput.value, {
      scoreWidth: 360,
      scoreHeight: 240,
      keySignatures: [KeySignatureTypeEnum.C],
      clefs: [ClefTypeEnum.Treble],
      random: Math.random
    })
    brick.value = generated
    musicScoreData.value = JSON.parse(JSON.stringify(generated.score))
    scoreRenderKey.value += 1
  } catch (error) {
    brick.value = null
    musicScoreData.value = null
    generateError.value = error instanceof Error ? error.message : '生成失败'
  }
}
</script>

<template>
  <div class="sub-mode-page">
    <header class="sub-mode-page__header">
      <BackButton fallback="/" />
      <h1 class="sub-mode-page__title">{{ title }}</h1>
    </header>

    <main class="sub-mode-page__main">
      <section class="brick-demo">
        <div class="brick-demo__controls">
          <label class="brick-demo__label">
            MIDI
            <input
              v-model.number="midiInput"
              class="brick-demo__input"
              type="number"
              :min="MIDI_BRICK_MIDI_MIN"
              :max="MIDI_BRICK_MIDI_MAX"
            />
          </label>
          <button class="brick-demo__btn" type="button" @click="handleGenerate">
            生成 MusicScore
          </button>
        </div>

        <p v-if="generateError" class="brick-demo__error">{{ generateError }}</p>
        <p v-else-if="metaText" class="brick-demo__meta">{{ metaText }}</p>

        <div v-if="musicScoreData" class="brick-demo__preview">
          <musicScoreVue
            :key="scoreRenderKey"
            class="brick-demo__score"
            :data="musicScoreData"
            :skin="scoreSkin"
            :skin-name="scoreSkinName"
          />
        </div>
        <p v-else class="brick-demo__hint">
          输入 MIDI（{{ MIDI_BRICK_MIDI_MIN }}–{{ MIDI_BRICK_MIDI_MAX }}），点击生成
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.sub-mode-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff8fb;
}

.sub-mode-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
}

.sub-mode-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.sub-mode-page__main {
  flex: 1;
  padding: 24px 20px 32px;
}

.brick-demo {
  max-width: 720px;
  margin: 0 auto;
}

.brick-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.brick-demo__label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #7a6888;
}

.brick-demo__input {
  width: 120px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 184, 208, 0.6);
  border-radius: 8px;
  font-size: 15px;
  color: #5c4a6a;
  background: #fff;
}

.brick-demo__btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #e889a8;
  cursor: pointer;
}

.brick-demo__btn:hover {
  background: #df7396;
}

.brick-demo__meta {
  margin: 14px 0 0;
  font-size: 13px;
  color: #8a7898;
  word-break: break-all;
}

.brick-demo__error {
  margin: 14px 0 0;
  font-size: 13px;
  color: #c45c5c;
}

.brick-demo__hint {
  margin: 24px 0 0;
  font-size: 14px;
  color: #9a8aa8;
}

.brick-demo__preview {
  margin-top: 20px;
  padding: 16px;
  min-height: 260px;
  border: 1px dashed rgba(255, 184, 208, 0.55);
  border-radius: 12px;
  background: #fff;
  overflow: auto;
}

.brick-demo__score {
  display: block;
  max-width: 100%;
}
</style>
