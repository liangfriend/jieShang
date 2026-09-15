<script lang="ts" setup>
import type { MidiSignalState } from '@renderer/views/tools/useMidiDiagnostics'

defineOptions({ name: 'MidiSignalPanel' })

defineProps<{
  signals: MidiSignalState
  heldNotes: number[]
}>()
</script>

<template>
  <div class="midi-signals">
    <div class="midi-signals__row">
      <div class="signal-lamp" :class="{ 'is-on': signals.activity }">
        <span class="signal-lamp__dot" />
        <span>{{ $t('tools.midi.signals.activity') }}</span>
      </div>
      <div class="signal-lamp" :class="{ 'is-on': signals.noteOn }">
        <span class="signal-lamp__dot" />
        <span>{{ $t('tools.midi.signals.noteOn') }}</span>
      </div>
      <div class="signal-lamp" :class="{ 'is-on is-pedal': signals.sustain }">
        <span class="signal-lamp__dot" />
        <span>{{ $t('tools.midi.signals.sustain') }}</span>
      </div>
      <div class="signal-lamp" :class="{ 'is-on is-pedal': signals.soft }">
        <span class="signal-lamp__dot" />
        <span>{{ $t('tools.midi.signals.soft') }}</span>
      </div>
      <div class="signal-lamp" :class="{ 'is-on is-pedal': signals.sostenuto }">
        <span class="signal-lamp__dot" />
        <span>{{ $t('tools.midi.signals.sostenuto') }}</span>
      </div>
    </div>

    <div class="midi-signals__meters">
      <label class="meter">
        <span>{{ $t('tools.midi.signals.pitchBend') }}</span>
        <div class="meter__track">
          <div
            class="meter__fill meter__fill--center"
            :style="{
              left: `${((signals.pitchBendNormalized + 1) / 2) * 100}%`
            }"
          />
        </div>
        <span class="meter__value">{{ signals.pitchBend }}</span>
      </label>
      <label class="meter">
        <span>{{ $t('tools.midi.signals.modulation') }}</span>
        <div class="meter__track">
          <div class="meter__fill" :style="{ width: `${(signals.modulation / 127) * 100}%` }" />
        </div>
        <span class="meter__value">{{ signals.modulation }}</span>
      </label>
      <label class="meter">
        <span>{{ $t('tools.midi.signals.expression') }}</span>
        <div class="meter__track">
          <div class="meter__fill" :style="{ width: `${(signals.expression / 127) * 100}%` }" />
        </div>
        <span class="meter__value">{{ signals.expression }}</span>
      </label>
      <label class="meter">
        <span>{{ $t('tools.midi.signals.volume') }}</span>
        <div class="meter__track">
          <div class="meter__fill" :style="{ width: `${(signals.volume / 127) * 100}%` }" />
        </div>
        <span class="meter__value">{{ signals.volume }}</span>
      </label>
      <label class="meter">
        <span>{{ $t('tools.midi.signals.channelPressure') }}</span>
        <div class="meter__track">
          <div
            class="meter__fill"
            :style="{ width: `${(signals.channelPressure / 127) * 100}%` }"
          />
        </div>
        <span class="meter__value">{{ signals.channelPressure }}</span>
      </label>
      <label class="meter">
        <span>{{ $t('tools.midi.signals.polyAftertouch') }}</span>
        <div class="meter__track">
          <div
            class="meter__fill"
            :style="{ width: `${(signals.polyAftertouch / 127) * 100}%` }"
          />
        </div>
        <span class="meter__value">{{ signals.polyAftertouch }}</span>
      </label>
    </div>

    <dl class="midi-signals__meta">
      <div>
        <dt>{{ $t('tools.midi.signals.channel') }}</dt>
        <dd>{{ signals.channel }}</dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.program') }}</dt>
        <dd>{{ signals.program }}</dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.lastNote') }}</dt>
        <dd>{{ signals.lastNote ?? '—' }}</dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.velocity') }}</dt>
        <dd>{{ signals.lastVelocity }}</dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.heldNotes') }}</dt>
        <dd>{{ heldNotes.length ? heldNotes.join(', ') : '—' }}</dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.polyAftertouchNote') }}</dt>
        <dd>{{ signals.polyAftertouchNote ?? '—' }}</dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.lastCc') }}</dt>
        <dd>
          {{
            signals.lastCc == null ? '—' : `${signals.lastCc} / ${signals.lastCcValue}`
          }}
        </dd>
      </div>
      <div>
        <dt>{{ $t('tools.midi.signals.input') }}</dt>
        <dd>{{ signals.lastInputName }}</dd>
      </div>
      <div class="midi-signals__meta--wide">
        <dt>{{ $t('tools.midi.signals.raw') }}</dt>
        <dd>{{ signals.lastBytes }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.midi-signals {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.78);
}

.midi-signals__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.signal-lamp {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(200, 180, 200, 0.45);
  background: rgba(248, 248, 252, 0.9);
  font-size: 12px;
  font-weight: 700;
  color: #8a7a96;
}

.signal-lamp__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c5c0cc;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.signal-lamp.is-on {
  color: #5c4a6a;
  border-color: rgba(255, 143, 184, 0.55);
}

.signal-lamp.is-on .signal-lamp__dot {
  background: #ff8fb8;
  box-shadow: 0 0 10px rgba(255, 143, 184, 0.75);
}

.signal-lamp.is-on.is-pedal .signal-lamp__dot {
  background: #6b8cff;
  box-shadow: 0 0 10px rgba(107, 140, 255, 0.7);
}

.midi-signals__meters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.meter {
  display: grid;
  grid-template-columns: 72px 1fr 42px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.meter__track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(233, 220, 235, 0.9);
  overflow: hidden;
}

.meter__fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffb8d0, #c9b8ff);
}

.meter__fill--center {
  width: 8px;
  margin-left: -4px;
  background: #6b8cff;
}

.meter__value {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #5c4a6a;
}

.midi-signals__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin: 0;
}

.midi-signals__meta div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 248, 251, 0.9);
}

.midi-signals__meta--wide {
  grid-column: 1 / -1;
}

.midi-signals__meta dt {
  font-size: 11px;
  color: #9a8aa8;
}

.midi-signals__meta dd {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  word-break: break-all;
}
</style>
