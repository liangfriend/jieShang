import { execSync, spawnSync } from 'node:child_process'

if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'ignore' })
  } catch {
    // ignore
  }
}

const args = process.argv.slice(2)
const result = spawnSync('electron-vite', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env
})

process.exit(result.status ?? 1)
