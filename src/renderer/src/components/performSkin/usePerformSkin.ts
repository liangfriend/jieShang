import { computed, onMounted, ref, watch, type CSSProperties } from 'vue'
import {
  fetchActivePerformSkinContentKey,
  resolvePerformSkinPack,
  useActivePerformSkinId
} from '@renderer/utils/collection/performSkinLoader'
import type { PerformSkinPack } from './types'

function svgToBackgroundStyle(svg: string): CSSProperties {
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat'
  }
}

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
  const skinBgStyle = computed(() => svgToBackgroundStyle(skin.value.bgSvg))
  const skinBaselineBgStyle = computed(() => svgToBackgroundStyle(skin.value.baselineSvg))

  return { performSkinId, skin, skinBgStyle, skinBaselineBgStyle }
}
