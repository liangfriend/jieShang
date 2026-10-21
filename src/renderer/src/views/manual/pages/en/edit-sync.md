"Score-audio sync" lines up a real audio recording (a vocal demo or an accompaniment) with the score: it tells the software at which second each note occurs in the audio. Once aligned, Play mode and Singing mode can **play this audio while the score highlighting follows along**, and Singing mode also uses these times to judge whether you are singing in tune.

To open it, click "Score-audio sync" in the bottom toolbar of Edit mode. The score-audio sync panel slides up from the bottom.

> Before you start, add the audio file to [My audio](#media).

## Terms

- **Vocal**: a demo recording with singing.
- **Accompaniment**: a backing track without vocals.
- A score can be bound to one vocal and one accompaniment at the same time. Each is aligned separately and has its own set of times.

## Panel layout

**First row of settings:**

| Setting | Description |
| --- | --- |
| Time property | "Vocal" or "Accompaniment": which one you are currently aligning. Defaults to "Accompaniment" |
| px/s | Pixels per second, 20–400, default 80. Higher values spread the waveform and notes further apart, making fine adjustment easier |
| Sample rate | Default 44100. Usually you don't need to change it |
| Audio | Choose an audio file from "My audio" to display its waveform and play it |

**Second row:** "Bind vocal" and "Bind accompaniment" set this score's vocal audio and accompaniment audio; both are chosen from "My audio". When you switch the "Time property", "Audio" automatically switches to the corresponding bound audio.

**Main area (top to bottom):**

1. **Audio waveform**.
2. **Flattened score**: the score with its repeats expanded and its grand staves joined, single-staff row by row, into one long strip. If a note is played several times because of repeats, it has several draggable boxes.
3. **Red playhead**: runs vertically through the waveform and the flattened score, with the current time in seconds shown above it. When stopped, you can drag the playhead to change the playback position; during playback the view scrolls automatically to keep the playhead in the middle.

**Bottom buttons:**

| Button | Function |
| --- | --- |
| Intro time | Enter the number of seconds between the start of the audio and the first note |
| Reset alignment | Recalculates the theoretical time of every note from the score's tempo, durations, repeats, and intro time |
| Play | Plays the audio from the playhead position |
| Stop | Pauses playback; the playhead stays where it is |
| Reset | Moves the playhead back to 0 seconds without changing note times |

## Alignment steps

1. Choose the audio in "Bind vocal" or "Bind accompaniment".
2. In "Time property", select the one you want to align (vocal or accompaniment).
3. Listen to the audio, measure the second at which the first note occurs, enter it in "Intro time", and click "Reset alignment" to get a rough alignment.
4. Click "Play" and watch the playhead and the note boxes as you listen. Wherever they don't match, **drag the note box left or right** on the flattened score to line it up with where the note actually occurs in the audio.
5. When you're done, close the panel, go back to the editor, and click "Save".

> The panel has **no separate save button**. The bindings and alignment are written directly into the current score, and are only actually saved when you click "Save" in the editor.

## Limitations

- Every grand staff must have the same number of single-staff rows; otherwise the score cannot be flattened and the panel shows an error.
- A score with an empty grand staff cannot be flattened either.
- The timeline is at most 10 minutes long.

## After aligning

- **Play mode**: in the "Score / Vocal / Accompaniment" drop-down at the bottom, choose "Vocal" or "Accompaniment". When the audio plays, the score is highlighted according to the aligned times. See [Features](#play-features).
- **Singing mode**: you can choose the vocal or the accompaniment as the audio source, and judging follows the aligned times. See [Singing mode](#play-singing).
- If audio is bound but not aligned, playback shows the message "No vocal sync times on this score" (likewise for the accompaniment).
