import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'

const deciphonyRoot = path.resolve(__dirname, '../deciphony/packages')
const rendererSrc = path.resolve(deciphonyRoot, 'deciphony-renderer/src')
const playerSrc = path.resolve(deciphonyRoot, 'deciphony-player/src')
const extensionsSrc = path.resolve(deciphonyRoot, 'deciphony-extensions/src')
const tuneJudgeSrc = path.resolve(deciphonyRoot, 'deciphony-tune-judge/src')
const workSrc = path.resolve(deciphonyRoot, 'deciphony-work/src')
const fingerSrc = path.resolve(deciphonyRoot, 'deciphony-finger/src')
const pitchDetectionSrc = path.resolve(deciphonyRoot, 'deciphony-pitch-detection/src')
const puffSrc = path.resolve(deciphonyRoot, 'deciphony-puff/src')

/** 包名 → 本地入口（无 dist 时也能跑，避免走 package.json exports → dist） */
const LOCAL_PACKAGE_ENTRY: Record<string, string> = {
  '@deciphony/renderer': path.resolve(rendererSrc, 'index.ts'),
  '@deciphony/player': path.resolve(playerSrc, 'index.ts'),
  '@deciphony/tune-judge': path.resolve(tuneJudgeSrc, 'index.ts'),
  '@deciphony/work': path.resolve(workSrc, 'index.ts'),
  '@deciphony/finger': path.resolve(fingerSrc, 'index.ts'),
  '@deciphony/pitch-detection': path.resolve(pitchDetectionSrc, 'index.ts'),
  '@deciphony/puff': path.resolve(puffSrc, 'index.ts')
}

/**
 * Vite 在解析已安装包时会先读 package.json 的 exports/main；
 * dist 被删后 alias 的 `$` 精确匹配经常来不及生效，会报 Failed to resolve entry。
 * 用 enforce:'pre' 的 resolveId 抢在包入口解析之前改写。
 */
const EXTENSIONS_CSS_ID = '@deciphony/extensions/css'
const extensionsLocalCssPlaceholder = path.resolve(
  __dirname,
  'src/renderer/src/styles/deciphonyExtensionsLocal.css'
)

function localDeciphonyResolvePlugin(): Plugin {
  const extensionsPrefix = '@deciphony/extensions'
  return {
    name: 'local-deciphony-resolve',
    enforce: 'pre',
    resolveId(id) {
      const entry = LOCAL_PACKAGE_ENTRY[id]
      if (entry) return entry

      if (id === EXTENSIONS_CSS_ID) return extensionsLocalCssPlaceholder

      // @deciphony/extensions 与子路径（如 /dr-edit/...）都指到本地源码
      if (id === extensionsPrefix || id.startsWith(`${extensionsPrefix}/`)) {
        const rest = id.slice(extensionsPrefix.length) // '' | '/dr-...'
        return path.resolve(extensionsSrc, rest.replace(/^\//, '') || 'index.ts')
      }

      return null
    }
  }
}

function buildRendererResolve(useLocalDeciphony: boolean) {
  type AliasItem = { find: string | RegExp; replacement: string }
  const alias: AliasItem[] = [
    { find: '@renderer', replacement: resolve('src/renderer/src') },
    // 包 exports 未暴露 css，显式指到构建产物，供宿主 import
    {
      find: '@deciphony/work/dist/work.css',
      replacement: useLocalDeciphony
        ? path.resolve(deciphonyRoot, 'deciphony-work/dist/work.css')
        : path.resolve(__dirname, 'node_modules/@deciphony/work/dist/work.css')
    },
    {
      find: '@deciphony/finger/dist/finger.css',
      replacement: useLocalDeciphony
        ? path.resolve(deciphonyRoot, 'deciphony-finger/dist/finger.css')
        : path.resolve(__dirname, 'node_modules/@deciphony/finger/dist/finger.css')
    }
  ]

  if (useLocalDeciphony) {
    // 正则精确匹配：避免 @deciphony/work/dist/... 被误重写；并与 resolveId 插件双保险
    for (const [pkg, entry] of Object.entries(LOCAL_PACKAGE_ENTRY)) {
      alias.push({
        find: new RegExp(`^${pkg.replace('/', '\\/')}$`),
        replacement: entry
      })
    }
    alias.push(
      // 打包版样式在 dist/extensions.css；源码模式由 SFC 注入，须排在通配规则之前
      { find: /^@deciphony\/extensions\/css$/, replacement: extensionsLocalCssPlaceholder },
      {
        find: /^@deciphony\/extensions(\/.*)?$/,
        replacement: `${extensionsSrc.replace(/\\/g, '/')}$1`
      },
      // 仅重写 `@/`，避免误伤 `@deciphony/*`；与 renderer 包入口同源，防止双实例
      { find: /^@\//, replacement: `${rendererSrc.replace(/\\/g, '/')}/` }
    )
  }

  return {
    alias,
    ...(useLocalDeciphony ? { dedupe: ['vue'] } : {})
  }
}

export default defineConfig(({ mode }) => {
  const useLocalDeciphony = mode === 'deciphony'

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
              exclude: [
                '@deciphony/renderer',
                '@deciphony/player',
                '@deciphony/extensions',
                '@deciphony/tune-judge',
                '@deciphony/work',
                '@deciphony/finger',
                '@deciphony/pitch-detection',
                '@deciphony/puff'
              ]
            }
          }
        : {}),
      plugins: [
        ...(useLocalDeciphony ? [localDeciphonyResolvePlugin()] : []),
        vue(),
        tailwindcss()
      ]
    }
  }
})
