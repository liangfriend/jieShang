import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const deciphonyRoot = path.resolve(__dirname, '../deciphony/packages')
const rendererSrc = path.resolve(deciphonyRoot, 'deciphony-renderer/src')
const playerSrc = path.resolve(deciphonyRoot, 'deciphony-player/src')
const coreSrc = path.resolve(deciphonyRoot, 'deciphony-core/src')

function buildRendererResolve(useLocalDeciphony: boolean) {
  const alias: Record<string, string> = {
    '@renderer': resolve('src/renderer/src')
  }

  if (useLocalDeciphony) {
    Object.assign(alias, {
      'deciphony-renderer': path.resolve(rendererSrc, 'index.ts'),
      'deciphony-player': path.resolve(playerSrc, 'index.ts'),
      'deciphony-core': path.resolve(coreSrc, 'index.ts'),
      // 必须与 deciphony-renderer 指向同一份源码，否则 @/ 与包入口会被 Vite 当成两个模块实例
      '@': rendererSrc
    })
  }

  return {
    alias,
    ...(useLocalDeciphony
      ? {
          dedupe: ['vue']
        }
      : {})
  }
}

export default defineConfig(({ mode }) => {
  const useLocalDeciphony = mode === 'local'

  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: buildRendererResolve(useLocalDeciphony),
      ...(useLocalDeciphony
        ? {
            optimizeDeps: {
              exclude: ['deciphony-renderer', 'deciphony-player', 'deciphony-core']
            }
          }
        : {}),
      plugins: [vue(), tailwindcss()]
    }
  }
})
