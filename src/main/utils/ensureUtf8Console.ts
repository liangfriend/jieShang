import { execSync } from 'node:child_process'

/** Windows 终端默认 GBK，主进程中文日志会乱码；启动时切到 UTF-8 (65001) */
export function ensureUtf8Console(): void {
  if (process.platform !== 'win32') return

  try {
    execSync('chcp 65001', { stdio: 'ignore' })
  } catch {
    // ignore
  }

  if (process.stdout.isTTY) {
    process.stdout.setEncoding('utf8')
  }
  if (process.stderr.isTTY) {
    process.stderr.setEncoding('utf8')
  }
}

ensureUtf8Console()
