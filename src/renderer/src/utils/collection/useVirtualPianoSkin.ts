import type { VirtualPianoPack } from '@renderer/types/collection'
import { computed, onMounted, ref, watch } from 'vue'
import { useActiveVirtualPianoSkinId } from '@renderer/utils/collection/collectionActiveStorage'
import { fetchActiveVirtualPianoPack } from '@renderer/utils/collection/virtualPianoSkinLoader'

const virtualPianoSkinId = useActiveVirtualPianoSkinId()

const pianoSkinPack = ref<VirtualPianoPack | null>(null)
const pianoSkinLoading = ref(false)

async function loadVirtualPianoSkin(): Promise<void> {
  pianoSkinLoading.value = true
  try {
    pianoSkinPack.value = await fetchActiveVirtualPianoPack()
  } finally {
    pianoSkinLoading.value = false
  }
}

watch(virtualPianoSkinId, () => {
  void loadVirtualPianoSkin()
})

/** 进入使用 VirtualPiano 的页面时，按 localStorage id 查库加载钢琴键皮肤 */
export function useVirtualPianoSkin() {
  onMounted(() => {
    void loadVirtualPianoSkin()
  })

  const pianoSkin = computed(() => pianoSkinPack.value ?? undefined)

  return {
    virtualPianoSkinId,
    pianoSkin,
    pianoSkinLoading: computed(() => pianoSkinLoading.value),
    waitVirtualPianoSkin: loadVirtualPianoSkin
  }
}
