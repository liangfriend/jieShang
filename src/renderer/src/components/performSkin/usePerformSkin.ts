import { computed, type CSSProperties } from 'vue'
import { getPerformSkinPack } from './registry'
import { useActivePerformSkinName } from '@renderer/utils/collection/collectionActiveStorage'

function svgToBackgroundStyle(svg: string): CSSProperties {
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat'
  }
}

export function usePerformSkin() {
  const performSkinName = useActivePerformSkinName()
  const skin = computed(() => getPerformSkinPack(performSkinName.value))
  const skinBgStyle = computed(() => svgToBackgroundStyle(skin.value.bgSvg))
  const skinBaselineBgStyle = computed(() => svgToBackgroundStyle(skin.value.baselineSvg))

  return { performSkinName, skin, skinBgStyle, skinBaselineBgStyle }
}
