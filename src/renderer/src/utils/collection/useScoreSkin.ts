import type { Skin } from 'deciphony-renderer'
import { computed, onMounted, ref, watch } from 'vue'
import {
  fetchActiveScoreSkin,
  useActiveScoreSkinId
} from '@renderer/utils/collection/scoreSkinLoader'

const scoreSkinId = useActiveScoreSkinId()

const activeSkinKey = ref<string | null>(null)
const skinPack = ref<Skin | null>(null)
const skinLoading = ref(false)

async function loadScoreSkin(): Promise<void> {
  skinLoading.value = true
  try {
    const loaded = await fetchActiveScoreSkin()
    if (!loaded) {
      activeSkinKey.value = null
      skinPack.value = null
      return
    }
    activeSkinKey.value = loaded.id
    skinPack.value = { [loaded.id]: loaded.pack }
  } finally {
    skinLoading.value = false
  }
}

watch(scoreSkinId, () => {
  void loadScoreSkin()
})

/** 进入使用 musicScore 的页面时，按 localStorage id 查库加载曲谱皮肤 */
export function useScoreSkin() {
  onMounted(() => {
    void loadScoreSkin()
  })

  const skin = computed(() => skinPack.value ?? undefined)
  const skinName = computed(() => activeSkinKey.value ?? undefined)

  return {
    scoreSkinId,
    skin,
    skinName,
    skinLoading: computed(() => skinLoading.value),
    waitScoreSkin: loadScoreSkin
  }
}
