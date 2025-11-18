import { useNodeManager } from '@renderer/composables/useNodeManager'
import { CSSProperties } from 'vue'
import { useGameData } from '@renderer/composables/useGameData'

const { editorNodeMap } = useNodeManager()
const { gameData } = useGameData()

export function runCode(code: string) {
  try {
    // 提供一个沙盒逻辑，避免污染全局
    const fn = new Function(
      'editorNodeMap,gameData',
      `
      try {
        ${code}
      } catch(e) {
        return { error: e.message };
      }
    `
    )
    const data = parseJS(gameData.value)
    return fn(editorNodeMap.value, data)
  } catch (e: any) {
    console.log('chicken', e)
    return e
  }
}

export function parseStyle(str: string): CSSProperties {
  try {
    return new Function(`return (${str})`)()
  } catch (e) {
    console.error('解析样式失败', e)
    return {}
  }
}
export function parseJS(str: string) {
  return new Function(`return (${str})`)()
}
