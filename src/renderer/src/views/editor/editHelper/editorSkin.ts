import {defaultSkin, MusicScoreTypeEnum, type SkinItem, type SkinPack} from '@deciphony/renderer'
import {computed, inject, provide, type ComputedRef, type InjectionKey} from 'vue'

/** 编辑器当前曲谱皮肤包，供属性栏绘制符号预览 */
const EDITOR_SKIN_PACK: InjectionKey<ComputedRef<SkinPack>> = Symbol('editorSkinPack')

export function provideEditorSkinPack(pack: () => SkinPack | undefined): void {
  provide(EDITOR_SKIN_PACK, computed(() => pack() ?? defaultSkin))
}

type NotationPackKey = 'standardStaff' | 'numberNotation'

function packKeyOf(type: MusicScoreTypeEnum | undefined): NotationPackKey {
  return type === MusicScoreTypeEnum.NumberNotation ? 'numberNotation' : 'standardStaff'
}

/** 按谱种取皮肤项；当前皮肤缺失时回退内置 defaultSkin */
export function useEditorSkinItem() {
  const pack = inject(EDITOR_SKIN_PACK, computed(() => defaultSkin))
  return (type: MusicScoreTypeEnum | undefined, skinKey: string): SkinItem | null => {
    const key = packKeyOf(type)
    const fromActive = (pack.value[key] as Record<string, SkinItem> | undefined)?.[skinKey]
    if (fromActive) return fromActive
    return (defaultSkin[key] as Record<string, SkinItem> | undefined)?.[skinKey] ?? null
  }
}
