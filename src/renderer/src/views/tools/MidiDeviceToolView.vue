<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import BackButton from '@renderer/components/BackButton.vue'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import MidiSignalPanel from '@renderer/views/tools/MidiSignalPanel.vue'
import { useMidiStore } from '@renderer/store/midi.store'
import { useVirtualPianoSkin } from '@renderer/utils/collection/useVirtualPianoSkin'
import { useMidiDiagnostics } from '@renderer/views/tools/useMidiDiagnostics'
import { usePlayStore } from '@renderer/store/play.store'

defineOptions({ name: 'MidiDeviceToolView' })

const MIDI_RANGE = { min: 21, max: 108 }
const PIANO_HEIGHT = '200px'

const { t } = useI18n()
const midiStore = useMidiStore()
const playStore = usePlayStore()
const { supported, accessGranted, inputs, outputs } = storeToRefs(midiStore)
const { pianoSkin, virtualPianoSkinId, waitVirtualPianoSkin } = useVirtualPianoSkin()
const { signals, heldNotes, start, resetSignals } = useMidiDiagnostics()

const ready = ref(false)

const inputRows = computed(() =>
  inputs.value.map((d) => ({
    ...d,
    statusText:
      d.state === 'connected'
        ? t('tools.midi.deviceConnected')
        : t('tools.midi.deviceDisconnected')
  }))
)

const outputRows = computed(() =>
  outputs.value.map((d) => ({
    ...d,
    statusText:
      d.state === 'connected'
        ? t('tools.midi.deviceConnected')
        : t('tools.midi.deviceDisconnected')
  }))
)

async function onPianoKeyDown(midi: number) {
  try {
    await playStore.triggerNote(midi, { id: `midi-tool-${midi}` })
  } catch {
    // ignore
  }
}

function onPianoKeyUp(midi: number) {
  playStore.releaseNote(midi)
}

onMounted(async () => {
  await Promise.all([
    midiStore.init(),
    waitVirtualPianoSkin(),
    playStore.waitReady().then(() => playStore.ensureCollectionToneColorInitialized())
  ]).catch(() => undefined)
  start()
  ready.value = true
})
</script>

<template>
  <div class="tool-page">
    <header class="tool-page__header">
      <BackButton fallback="/tools" />
      <h1 class="tool-page__title">{{ t('tools.midi.title') }}</h1>
      <button type="button" class="ghost-btn" @click="resetSignals">
        {{ t('tools.midi.resetSignals') }}
      </button>
    </header>

    <main class="tool-page__main">
      <section class="tool-card">
        <h2 class="tool-card__title">{{ t('tools.midi.devices') }}</h2>
        <p v-if="!supported" class="tool-hint tool-hint--error">
          {{ t('tools.midi.unsupported') }}
        </p>
        <p v-else-if="!accessGranted" class="tool-hint tool-hint--error">
          {{ t('tools.midi.noAccess') }}
        </p>
        <template v-else>
          <div class="device-grid">
            <div>
              <h3 class="device-grid__label">{{ t('tools.midi.inputs') }}</h3>
              <ul v-if="inputRows.length" class="device-list">
                <li v-for="device in inputRows" :key="device.id">
                  <strong>{{ device.name || t('midi.unknownDevice') }}</strong>
                  <span>{{ device.statusText }}</span>
                  <span v-if="device.manufacturer">{{ device.manufacturer }}</span>
                </li>
              </ul>
              <p v-else class="tool-hint">{{ t('tools.midi.noInputs') }}</p>
            </div>
            <div>
              <h3 class="device-grid__label">{{ t('tools.midi.outputs') }}</h3>
              <ul v-if="outputRows.length" class="device-list">
                <li v-for="device in outputRows" :key="device.id">
                  <strong>{{ device.name || t('midi.unknownDevice') }}</strong>
                  <span>{{ device.statusText }}</span>
                  <span v-if="device.manufacturer">{{ device.manufacturer }}</span>
                </li>
              </ul>
              <p v-else class="tool-hint">{{ t('tools.midi.noOutputs') }}</p>
            </div>
          </div>
        </template>
      </section>

      <section class="tool-card">
        <h2 class="tool-card__title">{{ t('tools.midi.signalsTitle') }}</h2>
        <MidiSignalPanel :signals="signals" :held-notes="heldNotes" />
      </section>

      <section class="tool-card tool-card--piano">
        <h2 class="tool-card__title">{{ t('tools.midi.pianoTitle') }}</h2>
        <p class="tool-hint">{{ t('tools.midi.pianoHint') }}</p>
        <div class="piano-wrap">
          <VirtualPiano
            v-if="ready && pianoSkin"
            :key="virtualPianoSkinId ?? 'default'"
            class="piano-wrap__inner"
            layout-mode="fillParent"
            :height="PIANO_HEIGHT"
            :midi="MIDI_RANGE"
            pitch-notation="Scientific"
            @key-down="onPianoKeyDown"
            @key-up="onPianoKeyUp"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.tool-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #5c4a6a;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.tool-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.tool-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.ghost-btn {
  margin-left: auto;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: #5c4a6a;
}

.tool-page__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.tool-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 8px 24px rgba(200, 140, 180, 0.12);
}

.tool-card__title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 800;
}

.tool-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #9a8aa8;
}

.tool-hint--error {
  color: #b91c1c;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.device-grid__label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.device-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 248, 251, 0.95);
  font-size: 12px;
  color: #9a8aa8;
}

.device-list strong {
  font-size: 13px;
  color: #5c4a6a;
}

.piano-wrap {
  width: 100%;
  min-height: 200px;
}

.piano-wrap__inner {
  width: 100%;
}

@media (max-width: 720px) {
  .device-grid {
    grid-template-columns: 1fr;
  }
}
</style>
