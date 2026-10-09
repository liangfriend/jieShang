import { computed, onMounted, ref, watch } from 'vue'
import {
  fetchActivePerformSkinSource,
  resolvePerformSkinPack,
  useActivePerformSkinId,
  type ActivePerformSkinSource
} from '@renderer/utils/collection/performSkinLoader'
import type { PerformSkinPack } from './types'

const performSkinId = useActivePerformSkinId()

const skinSource = ref<ActivePerformSkinSource | null>(null)
const performSkinLoading = ref(false)
const performSkinReady = ref(false)

async function loadPerformSkin(): Promise<void> {
  performSkinLoading.value = true
  try {
    skinSource.value = await fetchActivePerformSkinSource()
    performSkinReady.value = true
  } finally {
    performSkinLoading.value = false
  }
}

watch(performSkinId, () => {
  void loadPerformSkin()
})

/** 进入使用页时按 localStorage 中的 id 查库，content 索引本地皮肤包，option 传给可调参数的皮肤 */
export function usePerformSkin() {
  onMounted(() => {
    void loadPerformSkin()
  })

  const skin = computed<PerformSkinPack>(() => resolvePerformSkinPack(skinSource.value))

  return {
    performSkinId,
    skin,
    performSkinReady: computed(() => performSkinReady.value),
    performSkinLoading: computed(() => performSkinLoading.value),
    waitPerformSkin: loadPerformSkin
  }
}
