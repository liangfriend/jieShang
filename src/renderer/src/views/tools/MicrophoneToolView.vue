<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import { useMicWaveform } from '@renderer/views/tools/useMicWaveform'

defineOptions({ name: 'MicrophoneToolView' })

const { t } = useI18n()
const {
  supported,
  active,
  error,
  devices,
  selectedDeviceId,
  level,
  refreshDevices,
  bindCanvas,
  start,
  stop,
  setDeviceId
} = useMicWaveform()

const canvasRef = ref<HTMLCanvasElement | null>(null)

watch(canvasRef, (el) => bindCanvas(el), { immediate: true })

onMounted(async () => {
  await refreshDevices()
})

async function toggle() {
  if (active.value) await stop()
  else await start()
}
</script>

<template>
  <div class="tool-page">
    <header class="tool-page__header">
      <BackButton fallback="/tools" />
      <h1 class="tool-page__title">{{ t('tools.mic.title') }}</h1>
    </header>

    <main class="tool-page__main">
      <section class="tool-card">
        <h2 class="tool-card__title">{{ t('tools.mic.controls') }}</h2>
        <p v-if="!supported" class="tool-hint tool-hint--error">
          {{ t('tools.mic.unsupported') }}
        </p>
        <template v-else>
          <label class="field">
            <span class="field__label">{{ t('tools.mic.device') }}</span>
            <el-select
              :model-value="selectedDeviceId"
              :disabled="active"
              class="field__select"
              @update:model-value="(v) => setDeviceId(String(v ?? ''))"
            >
              <el-option
                v-for="device in devices"
                :key="device.deviceId"
                :label="device.label || t('tools.mic.unnamedDevice')"
                :value="device.deviceId"
              />
            </el-select>
          </label>

          <div class="actions">
            <button type="button" class="primary-btn" @click="toggle">
              {{ active ? t('tools.mic.stop') : t('tools.mic.start') }}
            </button>
            <button type="button" class="ghost-btn" :disabled="active" @click="refreshDevices">
              {{ t('tools.mic.refresh') }}
            </button>
          </div>

          <p v-if="error" class="tool-hint tool-hint--error">{{ error }}</p>
        </template>
      </section>

      <section class="tool-card">
        <h2 class="tool-card__title">{{ t('tools.mic.waveform') }}</h2>
        <div class="level">
          <span>{{ t('tools.mic.level') }}</span>
          <div class="level__track">
            <div class="level__fill" :style="{ width: `${Math.round(level * 100)}%` }" />
          </div>
          <span class="level__value">{{ Math.round(level * 100) }}%</span>
        </div>
        <canvas ref="canvasRef" class="waveform" width="900" height="220" />
        <p class="tool-hint">{{ t('tools.mic.hint') }}</p>
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

.tool-page__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  max-width: 960px;
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
  margin: 12px 0 0;
  font-size: 13px;
  color: #9a8aa8;
}

.tool-hint--error {
  color: #b91c1c;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.field__label {
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.field__select {
  width: min(420px, 100%);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary-btn,
.ghost-btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.ghost-btn {
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.75);
  color: #5c4a6a;
}

.ghost-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.level {
  display: grid;
  grid-template-columns: 64px 1fr 48px;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.level__track {
  height: 12px;
  border-radius: 999px;
  background: rgba(233, 220, 235, 0.9);
  overflow: hidden;
}

.level__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffb8d0, #8ec5ff);
  transition: width 0.08s linear;
}

.level__value {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.waveform {
  display: block;
  width: 100%;
  height: 220px;
  border-radius: 14px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.95);
}
</style>
