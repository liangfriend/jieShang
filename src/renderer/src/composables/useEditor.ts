import { Ref, ref } from 'vue'
import { ViewInfo } from '@renderer/types'

type UseEditor = {
  editorInfo: Ref<ViewInfo>
  resetEditorInfo: () => void
}

function setup(data) {
  let editorInfo = ref<ViewInfo>(
    data || {
      left: -5000,
      top: -5000,
      width: 10000,
      height: 10000,
      scale: 0.4
    }
  )

  // 重置数据
  const resetEditorInfo = () => {
    editorInfo.value = {
      left: -5000,
      top: -5000,
      width: 10000,
      height: 10000,
      scale: 0.4
    }
  }
  return {
    editorInfo,
    resetEditorInfo
  }
}

let res: UseEditor | null = null

export function updateLoadedEditorInfo(editorInfo: ViewInfo) {
  if (!res) {
    res = setup(editorInfo)
  } else {
    res.editorInfo.value = editorInfo
  }
}

export function useEditor() {
  if (!res) {
    res = setup({
      left: -5000,
      top: -5000,
      width: 10000,
      height: 10000,
      scale: 0.4
    })
  }
  return res
}
