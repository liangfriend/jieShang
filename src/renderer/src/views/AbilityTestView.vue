<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'

const { t } = useI18n()
const router = useRouter()

const tests = computed(() => [
  {
    route: 'rhythmSenseTest' as const,
    title: t('abilityTest.rhythm.title'),
    desc: t('abilityTest.rhythm.desc'),
    tint: '#fff0c9'
  },
  {
    route: 'absolutePitchTest' as const,
    title: t('abilityTest.absolutePitch.title'),
    desc: t('abilityTest.absolutePitch.desc'),
    tint: '#d4f0ff'
  },
  {
    route: 'keyNoteNameQuiz' as const,
    title: t('abilityTest.keyNoteName.title'),
    desc: t('abilityTest.keyNoteName.desc'),
    tint: '#ffd6e8'
  },
  {
    route: 'chordRecognitionQuiz' as const,
    title: t('abilityTest.chordRecognition.title'),
    desc: t('abilityTest.chordRecognition.desc'),
    tint: '#e8d5ff'
  }
])

function openTest(routeName: (typeof tests.value)[number]['route']) {
  router.push({ name: routeName })
}
</script>

<template>
  <div class="ability-test-page">
    <header class="ability-test-page__header">
      <BackButton fallback="/" />
      <h1 class="ability-test-page__title">{{ t('abilityTest.title') }}</h1>
    </header>

    <main class="ability-test-page__main">
      <button
        v-for="item in tests"
        :key="item.route"
        type="button"
        class="ability-card"
        :style="{ '--card-tint': item.tint }"
        @click="openTest(item.route)"
      >
        <h2 class="ability-card__title">{{ item.title }}</h2>
        <p class="ability-card__desc">{{ item.desc }}</p>
      </button>
    </main>
  </div>
</template>

<style scoped>
.ability-test-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.ability-test-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.ability-test-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.ability-test-page__main {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 24px;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  align-content: start;
}

.ability-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 140px;
  padding: 22px 18px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  background: color-mix(in srgb, var(--card-tint) 70%, white);
  box-shadow: 0 8px 32px rgba(200, 140, 180, 0.18);
  cursor: pointer;
  text-align: left;
  color: #5c4a6a;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ability-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(200, 140, 180, 0.28);
}

.ability-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.ability-card__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #9a8aa8;
}

@media (max-width: 640px) {
  .ability-test-page__main {
    grid-template-columns: 1fr;
  }
}
</style>
