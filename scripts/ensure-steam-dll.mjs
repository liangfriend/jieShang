import fs from 'node:fs'
import path from 'node:path'

const target = path.resolve('resources/steam/steam_api64.dll')

function tryCopyFromSdk() {
  const sdkRoot = process.env.STEAMWORKS_SDK
  if (!sdkRoot) return false

  const candidates = [
    path.join(sdkRoot, 'redistributable_bin', 'win64', 'steam_api64.dll'),
    path.join(sdkRoot, 'sdk', 'redistributable_bin', 'win64', 'steam_api64.dll')
  ]

  for (const source of candidates) {
    if (!fs.existsSync(source)) continue
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(source, target)
    console.log(`已复制 steam_api64.dll ← ${source}`)
    return true
  }

  return false
}

if (fs.existsSync(target)) {
  process.exit(0)
}

if (tryCopyFromSdk()) {
  process.exit(0)
}

console.warn(
  [
    '未找到 resources/steam/steam_api64.dll。',
    '请从 Steamworks SDK 的 redistributable_bin/win64/ 复制到该路径，',
    '或设置 STEAMWORKS_SDK 环境变量后重新运行打包。'
  ].join('')
)

process.exit(1)
