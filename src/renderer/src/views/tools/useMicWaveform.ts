import { onUnmounted, ref, shallowRef } from 'vue'

export function useMicWaveform() {
  const supported = ref(
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  )
  const active = ref(false)
  const error = ref('')
  const devices = shallowRef<MediaDeviceInfo[]>([])
  const selectedDeviceId = ref('')
  const level = ref(0)

  let stream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let rafId = 0
  let canvas: HTMLCanvasElement | null = null
  let timeData: Uint8Array | null = null

  async function refreshDevices() {
    if (!supported.value) return
    try {
      const list = await navigator.mediaDevices.enumerateDevices()
      devices.value = list.filter((d) => d.kind === 'audioinput')
      if (
        selectedDeviceId.value &&
        !devices.value.some((d) => d.deviceId === selectedDeviceId.value)
      ) {
        selectedDeviceId.value = ''
      }
      if (!selectedDeviceId.value && devices.value[0]?.deviceId) {
        selectedDeviceId.value = devices.value[0].deviceId
      }
    } catch {
      devices.value = []
    }
  }

  function bindCanvas(el: HTMLCanvasElement | null) {
    canvas = el
  }

  function drawFrame() {
    if (!analyser || !canvas || !timeData) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    analyser.getByteTimeDomainData(timeData as Uint8Array<ArrayBuffer>)

    let sum = 0
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i]! - 128) / 128
      sum += v * v
    }
    level.value = Math.min(1, Math.sqrt(sum / timeData.length) * 3)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'rgba(255, 248, 251, 0.92)'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(255, 143, 184, 0.35)'
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    ctx.lineWidth = 2
    ctx.strokeStyle = '#ff8fb8'
    ctx.beginPath()
    const slice = width / timeData.length
    for (let i = 0; i < timeData.length; i++) {
      const x = i * slice
      const y = ((timeData[i]! / 255) * height * 0.85) + height * 0.075
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  function tick() {
    drawFrame()
    rafId = window.requestAnimationFrame(tick)
  }

  async function start() {
    if (!supported.value || active.value) return
    error.value = ''
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId.value
          ? { deviceId: { exact: selectedDeviceId.value }, echoCancellation: false, noiseSuppression: false }
          : { echoCancellation: false, noiseSuppression: false },
        video: false
      })
      await refreshDevices()

      audioContext = new AudioContext()
      await audioContext.resume()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.85
      source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      timeData = new Uint8Array(analyser.fftSize)

      active.value = true
      tick()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      await stop()
    }
  }

  async function stop() {
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }
    source?.disconnect()
    source = null
    analyser = null
    timeData = null
    if (audioContext) {
      await audioContext.close().catch(() => undefined)
      audioContext = null
    }
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    active.value = false
    level.value = 0
  }

  async function setDeviceId(deviceId: string) {
    selectedDeviceId.value = deviceId
    if (active.value) {
      await stop()
      await start()
    }
  }

  onUnmounted(() => {
    void stop()
  })

  return {
    supported,
    active,
    error,
    devices,
    selectedDeviceId,
    level,
    refreshDevices,
    bindCanvas,
    start,
    stop,
    setDeviceId
  }
}
