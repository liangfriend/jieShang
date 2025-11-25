import { Ref, ref } from 'vue'
import { EditorInfo } from '@renderer/types'

type UseEditor = {
  editorInfo: Ref<EditorInfo>
  resetEditorInfo: () => void
}
export const defaultConfig = (function () {
  return {
    left: -5000,
    top: -5000,
    width: 100000,
    height: 100000,
    scale: 0.4
  }
})()
function setup(data) {
  let editorInfo = ref<EditorInfo>(data || defaultConfig)

  // 重置数据
  const resetEditorInfo = () => {
    editorInfo.value = defaultConfig
  }
  return {
    editorInfo,
    resetEditorInfo
  }
}

let res: UseEditor | null = null

export function updateLoadedEditorInfo(editorInfo: EditorInfo) {
  if (!res) {
    res = setup(editorInfo)
  } else {
    res.editorInfo.value = editorInfo
  }
}

export function useEditor() {
  if (!res) {
    res = setup(defaultConfig)
  }
  return res
}
