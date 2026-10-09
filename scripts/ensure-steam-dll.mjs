import fs from 'node:fs'
import path from 'node:path'

const target = path.resolve('resources/steam/steam_api64.dll')
const vcRuntimeTarget = path.resolve('resources/steam/vcruntime140.dll')

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

/** steamworks.js 的 .node 依赖 VCRUNTIME140.dll，未装 VC++ 运行库的机器需随包附带 */
function ensureVcRuntime() {
  if (fs.existsSync(vcRuntimeTarget)) return true
  const systemRoot = process.env.SystemRoot || 'C:\\Windows'
  const source = path.join(systemRoot, 'System32', 'vcruntime140.dll')
  if (!fs.existsSync(source)) {
    console.warn('未找到 vcruntime140.dll，请安装 VC++ 2015-2022 x64 运行库后重新打包。')
    return false
  }
  fs.mkdirSync(path.dirname(vcRuntimeTarget), { recursive: true })
  fs.copyFileSync(source, vcRuntimeTarget)
  console.log(`已复制 vcruntime140.dll ← ${source}`)
  return true
}

if (!ensureVcRuntime()) {
  process.exit(1)
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
