import { onMounted, onUnmounted } from 'vue'
import { useMidiStore } from '@renderer/store/midi.store'

/** 监听 MIDI note on（物理 MIDI 设备；本页不渲染虚拟键盘） */
export function useNoteSliceMidiInput(onNoteOn: (midi: number) => void): void {
  const midiStore = useMidiStore()

  function handleMidiMessage(event: MIDIMessageEvent): void {
    const data = event.data
    if (!data || data.length < 2) return

    const command = data[0]! & 0xf0
    const note = data[1]!
    const velocity = data.length > 2 ? data[2]! : 0

    if (command === 0x90 && velocity > 0) {
      onNoteOn(note)
    }
  }

  onMounted(async () => {
    await midiStore.init()
    midiStore.addMessageListener(handleMidiMessage)
  })

  onUnmounted(() => {
    midiStore.removeMessageListener(handleMidiMessage)
  })
}
