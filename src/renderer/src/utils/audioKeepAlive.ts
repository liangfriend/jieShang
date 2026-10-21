import { _audioContext } from '@deciphony/player'

/**
 * 蓝牙 / 部分耳机在输入持续静音约 1–3s 后会关闭功放省电，唤醒时吞掉下一个音的音头（钢琴只剩尾音）。
 * 常驻一路 30Hz、-50 dBFS 的正弦：人耳与耳机单元基本无法重放，但经蓝牙有损编码后仍非静音，耳机不会休眠。
 * 太弱（如 -84 dBFS 噪声）会被编码当成静音丢掉，实测无效。
 */
const KEEP_ALIVE_FREQUENCY_HZ = 30
const KEEP_ALIVE_LEVEL_DBFS = -50

let keepAliveOscillator: OscillatorNode | null = null

/** 在共享 AudioContext 上常驻保活信号；重复调用无副作用。须在 startJPlayer 之后调用 */
export function startAudioKeepAlive(): void {
  const ctx = _audioContext
  if (!ctx || keepAliveOscillator) return
  const gain = ctx.createGain()
  gain.gain.value = Math.pow(10, KEEP_ALIVE_LEVEL_DBFS / 20)
  gain.connect(ctx.destination)
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = KEEP_ALIVE_FREQUENCY_HZ
  osc.connect(gain)
  osc.start()
  keepAliveOscillator = osc
}
