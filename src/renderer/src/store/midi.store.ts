import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type MidiDeviceSnapshot = {
  id: string
  name: string
  manufacturer: string
  state: MIDIPortDeviceState
  connection: MIDIPortConnectionState
}

export type MidiMessageListener = (event: MIDIMessageEvent, input: MIDIInput) => void

function toDeviceSnapshot(port: MIDIPort): MidiDeviceSnapshot {
  return {
    id: port.id,
    name: port.name ?? '',
    manufacturer: port.manufacturer ?? '',
    state: port.state,
    connection: port.connection
  }
}

function deviceLabel(device: MidiDeviceSnapshot) {
  return device.name?.trim() || '未知 MIDI 设备'
}

function notifyDeviceStateChanges(
  previous: Map<string, MidiDeviceSnapshot>,
  current: MidiDeviceSnapshot[]
) {
  const currentMap = new Map(current.map((device) => [device.id, device]))
  const shown = new Set<string>()

  function show(type: 'connect' | 'disconnect', device: MidiDeviceSnapshot) {
    const label = deviceLabel(device)
    const key = `${type}:${label}`
    if (shown.has(key)) return
    shown.add(key)

    if (type === 'connect') {
      ElMessage.success(`MIDI 设备已连接：${label}`)
    } else {
      ElMessage.info(`MIDI 设备已断开：${label}`)
    }
  }

  for (const device of current) {
    const prev = previous.get(device.id)
    if (!prev) {
      if (device.state === 'connected') show('connect', device)
      continue
    }
    if (prev.state === device.state) continue

    show(device.state === 'connected' ? 'connect' : 'disconnect', device)
  }

  for (const [id, prev] of previous) {
    if (currentMap.has(id) || prev.state !== 'connected') continue
    show('disconnect', prev)
  }
}

export const useMidiStore = defineStore('midi', () => {
  const supported = ref(typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator)
  const accessGranted = ref(false)
  const inputs = ref<MidiDeviceSnapshot[]>([])
  const outputs = ref<MidiDeviceSnapshot[]>([])

  let midiAccess: MIDIAccess | null = null
  let initPromise: Promise<void> | null = null
  let notifyStateChange = false
  let notifyDebounceTimer: ReturnType<typeof setTimeout> | null = null
  let notifySnapshot: Map<string, MidiDeviceSnapshot> | null = null
  const messageListeners = new Set<MidiMessageListener>()
  const inputHandlers = new Map<MIDIInput, (event: MIDIMessageEvent) => void>()

  const hasConnectedInput = computed(() =>
    inputs.value.some((device) => device.state === 'connected')
  )
  const hasConnectedOutput = computed(() =>
    outputs.value.some((device) => device.state === 'connected')
  )

  function emitMessage(event: MIDIMessageEvent, input: MIDIInput) {
    messageListeners.forEach((listener) => listener(event, input))
  }

  function bindInput(input: MIDIInput) {
    if (input.state !== 'connected' || inputHandlers.has(input)) return

    const handler = (event: MIDIMessageEvent) => emitMessage(event, input)
    inputHandlers.set(input, handler)
    input.onmidimessage = handler
  }

  function unbindInput(input: MIDIInput) {
    const handler = inputHandlers.get(input)
    if (!handler) return
    if (input.onmidimessage === handler) {
      input.onmidimessage = null
    }
    inputHandlers.delete(input)
  }

  function updateDeviceLists() {
    if (!midiAccess) {
      inputs.value = []
      outputs.value = []
      return
    }

    inputs.value = [...midiAccess.inputs.values()].map(toDeviceSnapshot)
    outputs.value = [...midiAccess.outputs.values()].map(toDeviceSnapshot)

    for (const input of [...inputHandlers.keys()]) {
      if (input.state !== 'connected') {
        unbindInput(input)
      }
    }

    midiAccess.inputs.forEach((input) => bindInput(input))
  }

  function flushNotifications() {
    notifyDebounceTimer = null
    if (!notifySnapshot) return

    notifyDeviceStateChanges(notifySnapshot, inputs.value)
    notifySnapshot = null
  }

  function scheduleNotifications() {
    if (notifyDebounceTimer) clearTimeout(notifyDebounceTimer)
    notifyDebounceTimer = setTimeout(flushNotifications, 80)
  }

  function syncDevices() {
    if (notifyStateChange && !notifySnapshot) {
      notifySnapshot = new Map(inputs.value.map((device) => [device.id, device]))
    }

    updateDeviceLists()

    if (notifyStateChange) {
      scheduleNotifications()
    }
  }

  function handleStateChange() {
    syncDevices()
  }

  async function init() {
    if (accessGranted.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      if (!supported.value) return

      try {
        midiAccess = await navigator.requestMIDIAccess()
        accessGranted.value = true
        midiAccess.onstatechange = handleStateChange
        syncDevices()
        notifyStateChange = true
      } catch {
        accessGranted.value = false
        inputs.value = []
        outputs.value = []
      }
    })()

    return initPromise
  }

  function addMessageListener(listener: MidiMessageListener) {
    messageListeners.add(listener)
  }

  function removeMessageListener(listener: MidiMessageListener) {
    messageListeners.delete(listener)
  }

  /** 虚拟钢琴 UI 触键：广播给 waterfall / midiBox */
  function dispatchVirtualNote(midi: number, on: boolean, velocity = 100) {
    const status = on ? 0x90 : 0x80
    const data = on ? [status, midi, velocity] : [status, midi, 0]
    emitMessage({ data: new Uint8Array(data) } as MIDIMessageEvent, {} as MIDIInput)
  }

  return {
    supported,
    accessGranted,
    inputs,
    outputs,
    hasConnectedInput,
    hasConnectedOutput,
    init,
    syncDevices,
    addMessageListener,
    removeMessageListener,
    dispatchVirtualNote
  }
})
