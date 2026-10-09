/**
 * 将 @deciphony/renderer default.json 的 tab6/tab4 合并进宿主内置曲谱皮肤。
 * 主题皮肤按各自 standardStaff.single_barline 的 stroke 色重着色。
 */
const fs = require('fs')
const path = require('path')

const skinsDir = path.join(__dirname, '../src/main/resources/scoreSkins')
const fullPath = path.join(
  __dirname,
  '../../deciphony/packages/deciphony-renderer/src/skins/default.json'
)

const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
if (!full.tab6 || !full.tab4) {
  throw new Error('renderer default.json missing tab6/tab4')
}

function extractBarlineStroke(skin) {
  const content = skin?.standardStaff?.single_barline?.content
  if (!content) return null
  const m = content.match(/stroke="([^"]+)"/)
  return m?.[1] ?? null
}

function recolorPack(pack, color) {
  const out = {}
  for (const [key, item] of Object.entries(pack)) {
    const colorOnly =
      item.w === 0 && item.h === 0 && !String(item.content ?? '').trim().startsWith('<')
    out[key] = {
      ...item,
      content: colorOnly
        ? color
        : String(item.content)
            .replace(/stroke="black"/g, `stroke="${color}"`)
            .replace(/fill="black"/g, `fill="${color}"`)
    }
  }
  return out
}

const skins = ['default', 'glacier', 'moHua', 'cosmos', 'dawn', 'bambooForest']

for (const name of skins) {
  const file = path.join(skinsDir, `${name}.json`)
  const skin = JSON.parse(fs.readFileSync(file, 'utf8'))
  const stroke = extractBarlineStroke(skin)
  const useDefaultColor = !stroke || stroke === 'black'

  skin.tab6 = useDefaultColor ? structuredClone(full.tab6) : recolorPack(full.tab6, stroke)
  skin.tab4 = useDefaultColor ? structuredClone(full.tab4) : recolorPack(full.tab4, stroke)

  fs.writeFileSync(file, JSON.stringify(skin, null, 2) + '\n', 'utf8')
  console.log(
    `updated ${name}: tab6=${Object.keys(skin.tab6).length} tab4=${Object.keys(skin.tab4).length}` +
      (useDefaultColor ? ' (default black)' : ` (recolor ${stroke})`)
  )
}
