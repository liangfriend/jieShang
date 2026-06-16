import { computed, onMounted, ref, watch } from 'vue'
import {
  fetchActivePerformSkinContentKey,
  resolvePerformSkinPack,
  useActivePerformSkinId
} from '@renderer/utils/collection/performSkinLoader'
import type { PerformSkinPack } from './types'

/** 进入使用页时按 localStorage 中的 id 查库，content 索引本地皮肤包 */
export function usePerformSkin() {
  const performSkinId = useActivePerformSkinId()
  const skinContentKey = ref<string | null>(null)

  async function loadPerformSkin() {
    skinContentKey.value = await fetchActivePerformSkinContentKey()
  }

  onMounted(() => {
    void loadPerformSkin()
  })

  watch(performSkinId, () => {
    void loadPerformSkin()
  })

  const skin = computed<PerformSkinPack>(() => resolvePerformSkinPack(skinContentKey.value))

  return { performSkinId, skin }
}
