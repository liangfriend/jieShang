<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'

defineOptions({ name: 'InstrumentSimView' })

const { t } = useI18n()
const router = useRouter()

type InstrumentItem = {
  key: 'guitar' | 'harmonica' | 'violin' | 'xiao'
  route?: 'guitarSim' | 'harmonicaSim' | 'violinSim'
  toneCollectionId?: number
  tint: string
  available: boolean
}

const ownedToneIds = ref<Set<number>>(new Set())
const loading = ref(true)

const items: InstrumentItem[] = [
  {
    key: 'guitar',
    route: 'guitarSim',
    toneCollectionId: BUILTIN_COLLECTION_SEED_IDS.toneColor.尼龙弦吉他,
    tint: '#ffe8c8',
    available: true
  },
  {
    key: 'harmonica',
    route: 'harmonicaSim',
    toneCollectionId: BUILTIN_COLLECTION_SEED_IDS.toneColor.口琴,
    tint: '#d4f0ff',
    available: true
  },
  {
    key: 'violin',
    route: 'violinSim',
    toneCollectionId: BUILTIN_COLLECTION_SEED_IDS.toneColor.小提琴,
    tint: '#ffe0e8',
    available: true
  },
  {
    key: 'xiao',
    tint: '#e8d5ff',
    available: false
  }
]

function isOwned(item: InstrumentItem): boolean {
  if (item.toneCollectionId == null) return false
  return ownedToneIds.value.has(item.toneCollectionId)
}

function isDisabled(item: InstrumentItem): boolean {
  return !item.available || !isOwned(item)
}

function open(item: InstrumentItem) {
  if (isDisabled(item) || !item.route) return
  router.push({ name: item.route })
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await window.api.collection.query({ type: 'tone_color', owned: true })
    const rows = res?.success && Array.isArray(res.data) ? res.data : []
    ownedToneIds.value = new Set(
      rows.map((r: { id: number }) => Number(r.id)).filter((id: number) => Number.isFinite(id))
    )
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="instrument-sim-page">
    <header class="instrument-sim-page__header">
      <BackButton fallback="/" />
      <h1 class="instrument-sim-page__title">{{ t('instrumentSim.title') }}</h1>
    </header>

    <main v-loading="loading" class="instrument-sim-page__main">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="instrument-card"
        :class="{ 'instrument-card--disabled': isDisabled(item) }"
        :style="{ '--card-tint': item.tint }"
        :disabled="isDisabled(item)"
        @click="open(item)"
      >
        <h2 class="instrument-card__title">{{ t(`instrumentSim.${item.key}.name`) }}</h2>
        <p class="instrument-card__desc">{{ t(`instrumentSim.${item.key}.desc`) }}</p>
        <p v-if="!item.available" class="instrument-card__badge">
          {{ t(`instrumentSim.${item.key}.soon`) }}
        </p>
        <p v-else-if="!isOwned(item)" class="instrument-card__badge">
          {{ t('instrumentSim.locked') }}
        </p>
      </button>
    </main>
  </div>
</template>

<style scoped>
.instrument-sim-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.instrument-sim-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.instrument-sim-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.instrument-sim-page__main {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px;
  max-width: 1040px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  align-content: start;
}

.instrument-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
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
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.instrument-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(200, 140, 180, 0.28);
}

.instrument-card--disabled,
.instrument-card:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(0.35);
}

.instrument-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.instrument-card__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #7a6a88;
}

.instrument-card__badge {
  margin: auto 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #a06080;
}
</style>
