import fs from 'node:fs'
import path from 'node:path'

const activeDir = 'src/renderer/src/assets/achievements/active'
const inactiveDir = 'src/renderer/src/assets/achievements/inactive'

const replacements = [
  [/#1A1040/gi, '#3A3A48'],
  [/#FFF8FB/gi, '#EEEEF2'],
  [/#FFF5FA/gi, '#EEEEF2'],
  [/#FFF8E8/gi, '#ECECEF'],
  [/#FFF5E8/gi, '#ECECEF'],
  [/#FFF0E8/gi, '#EAEAEE'],
  [/#FFF0D6/gi, '#E8E8EC'],
  [/#FFF8F0/gi, '#EDEDF1'],
  [/#F8F0FF/gi, '#ECECEF'],
  [/#F0FFF8/gi, '#ECECEF'],
  [/#F0FAFF/gi, '#E8EAEE'],
  [/#EEF8FF/gi, '#E6E8EC'],
  [/#E8F8FF/gi, '#E4E6EA'],
  [/#E8F0FF/gi, '#E4E6EA'],
  [/#E8F4FF/gi, '#E2E4E8'],
  [/#FFB8D0/gi, '#B8B8C4'],
  [/#FF8FB8/gi, '#A0A0B0'],
  [/#FF6B9D/gi, '#9090A4'],
  [/#FF6B20/gi, '#9090A4'],
  [/#FF8F5A/gi, '#A0A0B0'],
  [/#FF9F43/gi, '#A8A8B4'],
  [/#FFC96B/gi, '#B0B0BC'],
  [/#E8B84A/gi, '#B0B0BC'],
  [/#E8A020/gi, '#A8A8B4'],
  [/#E85A20/gi, '#A0A0B0'],
  [/#E8407A/gi, '#9090A4'],
  [/#9A6B00/gi, '#888894'],
  [/#B83060/gi, '#888894'],
  [/#7EC8E3/gi, '#A8B0B8'],
  [/#5BA8D4/gi, '#98A0A8'],
  [/#3D8AB8/gi, '#889098'],
  [/#5C7A9A/gi, '#888894'],
  [/#9AD9C8/gi, '#B0B8B4'],
  [/#3DA88A/gi, '#98A0A0'],
  [/#2D7A62/gi, '#888890'],
  [/#9AD4F0/gi, '#B0B8C0'],
  [/#8BA4E8/gi, '#A8A8B8'],
  [/#6B8AE8/gi, '#9898A8'],
  [/#8B6BE8/gi, '#9898A8'],
  [/#B88AE8/gi, '#A8A0B0'],
  [/#7A4AB8/gi, '#888890'],
  [/#C4B0FF/gi, '#B8B8C4'],
  [/#E8DCFF/gi, '#D8D8E0'],
  [/#FFCC80/gi, '#B8B8C4'],
  [/#FFFFFF/gi, '#E8E8EC'],
  [/#FFF\b/gi, '#E8E8EC']
]

for (const file of fs.readdirSync(activeDir).filter((f) => f.endsWith('.svg'))) {
  let svg = fs.readFileSync(path.join(activeDir, file), 'utf8')
  for (const [from, to] of replacements) {
    svg = svg.replace(from, to)
  }
  svg = svg.replace(/opacity="0\.6"/g, 'opacity="0.45"')
  fs.writeFileSync(path.join(inactiveDir, file), svg, 'utf8')
}

console.log(`generated ${fs.readdirSync(inactiveDir).length} inactive svgs`)
