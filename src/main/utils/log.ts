import fs from 'fs'
import path from 'path'
import util from 'util'
import pathManager from './pathManager'

const LOG_DIR = pathManager.getLogDir()

function getLogFilePath() {
  const date = new Date().toISOString().slice(0, 10)
  return path.join(LOG_DIR, `${date}.log`)
}

function writeToFile(message: string) {
  fs.appendFileSync(getLogFilePath(), message + '\n', 'utf8')
}

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

export function getLogger(prefix: string) {
  function format(level: string, args: any[]) {
    const timestamp = new Date().toISOString()
    const msg = util.format.apply(null, args)

    return `[${timestamp}] [${level}] [${prefix}] ${msg}`
  }

  return {
    info(...args: any[]) {
      const msg = format('INFO', args)
      console.log(colors.green + msg + colors.reset)
      writeToFile(msg)
    },

    warn(...args: any[]) {
      const msg = format('WARN', args)
      console.warn(colors.yellow + msg + colors.reset)
      writeToFile(msg)
    },

    error(...args: any[]) {
      const msg = format('ERROR', args)
      console.error(colors.red + msg + colors.reset)
      writeToFile(msg)
    },

    debug(...args: any[]) {
      if (process.env.NODE_ENV === 'production') return // 生产环境禁用 debug

      const msg = format('DEBUG', args)
      console.log(colors.cyan + msg + colors.reset)
      writeToFile(msg)
    }
  }
}
