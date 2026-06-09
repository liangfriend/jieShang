import type { Skin } from 'deciphony-renderer'
import { computed, onMounted, ref, watch } from 'vue'
import {
  fetchActiveScoreSkin,
  useActiveScoreSkinId
} from '@renderer/utils/collection/scoreSkinLoader'

/** 进入使用 musicScore 的页面时，按 localStorage id 查库加载曲谱皮肤 */
export function useScoreSkin() {
  const scoreSkinId = useActiveScoreSkinId()
  const activeSkinKey = ref<string | null>(null)
  const skinPack = ref<Skin | null>(null)

  async function loadScoreSkin() {
    const loaded = await fetchActiveScoreSkin()
    if (!loaded) {
      activeSkinKey.value = null
      skinPack.value = null
      return
    }
    activeSkinKey.value = loaded.id
    skinPack.value = { [loaded.id]: loaded.pack }
  }

  onMounted(() => {
    void loadScoreSkin()
  })

  watch(scoreSkinId, () => {
    void loadScoreSkin()
  })

  const skin = computed(() => skinPack.value ?? undefined)
  const skinName = computed(() => activeSkinKey.value ?? undefined)

  return { scoreSkinId, skin, skinName, reloadScoreSkin: loadScoreSkin }
}
