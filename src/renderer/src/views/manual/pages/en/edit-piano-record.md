"Piano input" records what you play on a MIDI keyboard into a piano score in real time: the right hand goes to the treble staff and the left hand to the bass staff. It's available for **staff notation** only; open it with the "Piano input" button in the top-right corner of Edit mode.

> A MIDI keyboard must be connected. If none is connected, you'll see "Piano input needs a MIDI keyboard. Please connect one and try again."

## Settings before recording

After you click "Piano input", the "Piano input" panel opens at the bottom:

| Setting | Description |
| --- | --- |
| Tempo | 30–240. Defaults to the score's tempo (90 if the score has no tempo). Start with a slower tempo; playing steadily makes the recording more accurate |
| Time | The time signature used for recording. Changing it clears any result already recorded |
| Metronome while recording | On by default. Playing along with the metronome gives a more accurate rhythm |
| Metronome volume | 0–100, default 80 |
| MIDI device | Shows the name of the connected device, or "Not connected" if there is none |

"Recording settings" also contains three advanced options. They are saved on this computer, and you can click "Reset to defaults" to restore them:

| Option | Default | Description |
| --- | --- | --- |
| Beat snap (beats) | 0.2 | A note that starts within this distance of a beat counts as on the beat, which removes slight early or late timing. At 0.25 or below, real off-beat sixteenth notes are not pulled in. Set it to 0 to turn it off |
| Shortest rest | 8th note | If the gap between two notes of the same hand is shorter than this, it's merged into the previous note and no rest is written. The trade-off is that to write a short rest, you have to pause at least this long. Options: never merge / 16th note / 8th note / quarter note |
| Latency compensation (ms) | 0 | This value is subtracted from every key press time. Use it when your recordings are consistently late overall (for example, when the metronome has output latency). Don't set it too high |

## Recording steps

1. Click "Start recording". One **count-in** measure plays first; listen to it, then start playing. You can click "Cancel" during the count-in.
2. Timing starts when the count-in ends. Play your MIDI keyboard along with the beat, and the score scrolls in real time to show what's been recorded.
3. When you're done, click "Stop recording". The panel shows how many note groups were recorded. If you're not happy with it, click "Record again".
4. Click "Apply to score" and confirm. The recording **overwrites everything in the current score**.

## Recording rules

- Notes are quantized to sixteenth notes based on the tempo.
- **Automatic hand splitting**: the software decides based on where the notes are and how your hands move, rather than simply splitting at middle C, so a continuous melody that crosses middle C won't jump between staves. When the notes pressed at once span more than an octave, they are split between the two hands at the largest interval in the middle.
- Notes pressed at almost the same time (within about 60 ms) count as one chord.
- Notes that cross a barline are split and joined with ties. Each row holds 4 measures.
- The current score's key signature, title, and page width are kept.

## Other input methods

Besides piano input, you can also enter staff notation note by note with the mouse, the computer keyboard, or a MIDI keyboard. See [Staff editing](#edit-staff) and [Notes](#edit-staff-note).
