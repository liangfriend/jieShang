Singing mode uses your microphone to detect the pitch you sing in real time, draws it on a waterfall chart against the reference pitch, and gives you an overall score when you finish.

> **Wearing headphones** is recommended. Echo cancellation isn't enabled, so when you use speakers, the microphone may pick up the backing audio as if it were your voice.

## Requirements

- You need a microphone; allow microphone access the first time you use this mode. You can first confirm that your microphone works in [Microphone check](#tool-mic).
- The entry conditions are the same as for the other sub-modes; see [Play mode](#score-play).
- **Only the first line (the first single staff) is judged**; other lines are dimmed. Usually you put the melody on the first line.

## Layout

- **Score**: one long line that scrolls automatically.
- **Info bar**: BPM, the number of notes to judge, the current offset, and the status ("Get ready" / "Detecting").
- **Waterfall chart**: a horizontal pitch chart covering C2 to C6, with each C marked on the left. Notes move from right to left; when a note passes the fixed vertical line in the middle, that's when you should sing it.
- **Offset bar** and **toolbar**.

Colors in the waterfall chart:

| Element | Meaning |
| --- | --- |
| Pink bar | Reference: the pitch and length you should sing |
| Green bar | Sung: the parts you sang correctly |
| Yellow dot | Live pitch: the pitch you're singing right now; shown only while detecting |

## Choosing an audio source

Use the drop-down in the toolbar to choose what plays along while you sing:

| Source | Description |
| --- | --- |
| Score | Plays the score itself (all parts) at the score's tempo |
| Vocal | Plays the bound vocal audio; judging uses the times aligned in [Score-audio sync](#edit-sync) |
| Accompaniment | Plays the bound accompaniment audio; judging uses the times aligned in Score-audio sync |

- If no vocal or accompaniment is bound, the corresponding option is grayed out.
- When you choose Vocal or Accompaniment, notes without aligned times aren't judged; if no notes are aligned at all, the "Start" button is unavailable.

## Start singing

1. Choose a source and click "Start".
2. Once the microphone is on, a 3, 2, 1 countdown appears on the left side of the waterfall chart.
3. When the countdown ends, the source starts playing; just sing along.
4. It ends automatically after the last note, or you can click "Stop" at any time. Stopping during the countdown produces no result.

Singing mode has no volume, BPM, or tone controls.

## Judging rules

- When the note you sing is **within 3 semitones** of the target note, it's corrected to the target note.
- The app automatically estimates how many semitones your voice is offset from the score overall. So a man singing a song written for a woman, or singing a whole octave lower, can still be judged correctly.
- Notes on the score get colored outlines based on the result.

### Initial pitch offset

"Initial pitch offset" in the offset bar (-48 to 48 semitones, default 0) tells the app how much higher or lower than the score you usually sing, so judging is aligned right from the start:

- For example, if you usually sing an octave lower, enter -12.
- The value takes effect as soon as you start; after you click "Save", the app also starts from this offset the next time you open it.

## Results

When you finish singing, the "Singing result" dialog appears with scores in three areas:

| Item | Meaning |
| --- | --- |
| Pitch | Of the total length of all notes, how much of the time you sang at the correct pitch |
| Rhythm | How many notes you sang correctly within a sixteenth note's time after they start |
| Completeness | How many notes you sang correctly at some point while they lasted |

The total score is the average of the three: 90 or above is "Excellent!", 80 or above "Great", 70 or above "Nice", 60 or above "Keep going", and below 60 "Try again". Click "Got it" to close. Results aren't saved.

## Entering from a work

In Presentation mode in "My works", right-click a score that has a vocal or accompaniment and choose "Enter singing mode" to sing it directly; see [Element features](#work-show-elements).
