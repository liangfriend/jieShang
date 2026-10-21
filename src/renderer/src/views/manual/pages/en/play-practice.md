Practice mode works like a rhythm game: notes fall from the top, and when they reach the keys, you press the matching key. The app judges how accurately you hit it.

## Interface

From top to bottom:

- **Score**: the whole score joined into one long line that scrolls automatically during playback.
- **Stats bar**: Total notes, Miss, Early, Late, Pass, Great, Perfect, Live score, and Progress.
- **Waterfall**: covers all 88 keys. When a note block reaches the bottom, that is the moment to press the key.
- **On-screen piano**.
- **Toolbar**.

## Toolbar

| Button | Description |
| --- | --- |
| Back | Returns to Play mode |
| Settings | Opens "Practice settings" (see below). Can only be opened while stopped |
| Play | Starts practice. When you start from the stopped state, the metronome first plays one measure as a count-in |
| Demo play | Counts down 3 seconds, then plays the piece automatically once. Every note is judged Perfect and the keys light up, so you can first watch how it is played. During the demo the button changes to "Stop demo" |
| Pause / Stop | After pausing, click "Play" to continue right away without the count-in |
| Tone | The tone used for score playback. Can only be changed while stopped |
| Score type / Transpose / Up ½ / Down ½ | Same as in [Play mode](#play-features); the changes are only temporary |
| Clear play data | Clears the stats and the colors on the score |
| Shortcuts | Shows the computer keyboard key map; see "Playing with the computer keyboard" below |
| Hide score / Show score | Hide the score to practice with the waterfall only |

## How to play

You can play in three ways:

- **MIDI keyboard** (recommended).
- Clicking the on-screen piano with the **mouse**.
- **Computer keyboard**; see "Playing with the computer keyboard" below.

> Keys pressed in any of the three ways make a piano sound. Their volume is set by "Virtual piano volume" in "Practice settings"; set it to 0 to hear only the score playback. Keys played automatically during Demo play do not make an extra sound.

### Playing with the computer keyboard

The computer keyboard is laid out by numbered notation (1 = C). Pressing a key works exactly like a MIDI keyboard: it makes a sound, lights up the key, and is judged. You don't need to open anything to play.

Click "Shortcuts" in the toolbar to show the key map. Each keycap shows its numbered note with octave dots, and keys light up while pressed. Drag the title bar to move the window; click "Shortcuts" again or the × in the top-right corner to close it.

Default pitches (C4 is middle C):

| Keys | Pitches |
| --- | --- |
| Number row `1`–`7`, `8`–`=` | C5–B5, C6–G6 |
| `Q`–`U`, `I`–`\` | C4–B4, C5–A5 |
| `A`–`J`, `K`–`'` | C3–B3, C4–F4 |
| `Z`–`M`, `,`–`/` | C2–B2, C3–E3 |
| Numpad `0` `.` | A3, B3 |
| Numpad `1`–`7` | C4–B4 |
| Numpad `8` `9` `/` `*` `-` `+` `Enter` | C5–B5 |

- Hold **Shift** while pressing a key to raise it a semitone (for black keys).
- Below the key map are two octave settings: "Letter keys octave" shifts the main keyboard area and "Numpad octave" shifts the numpad, each from −3 to +3. The note currently on `Q` and numpad `1` is shown next to each. The settings are saved automatically and shared by Practice mode, Beginner mode and the Teaching whiteboard.
- Keys outside the 88-key range make no sound, and their numbers are dimmed.
- Keys don't play while Ctrl, Alt or Win is held, or while the cursor is in a text box.

## Judging rules

- Only the gap between **the moment you press** a key and the start of the note is judged; when you release it and how long you hold it are not.
- A wrong key that is not within the judging window of any note is simply ignored, with no penalty.
- A note that passes its judging window without being played counts as "Miss".
- The waterfall always moves at the set tempo and **does not wait for you**. To practice at your own pace, use [Beginner mode](#play-beginner).

Judging windows (in milliseconds; plus and minus mean early and late):

| Difficulty | Perfect | Great | Pass | Early / Late |
| --- | --- | --- | --- | --- |
| Beginner (default) | ±90 | ±140 | ±200 | ±260 |
| Intermediate | ±35 | ±60 | ±100 | ±150 |
| Master | ±20 | ±35 | ±60 | ±100 |

**Live score** is the average score of the notes judged so far: Perfect 100, Great 80, Pass 60, Early / Late 50, Miss 0. **Progress** is the share of all notes that have been judged.

The stats stay on screen after the piece ends and reset the next time you "Play" from the beginning or click "Clear play data". Practice results are not saved and do not count toward achievements.

## Colors on the score

When "Show note results in real time" is on, notes on the score change color according to their result:

| Result | Color |
| --- | --- |
| Perfect | Rainbow gradient |
| Great | Green |
| Pass | Orange |
| Early | Light blue |
| Late | Light pink |
| Miss | Red |

While stopped, you can hold `Shift` and scroll the mouse wheel to look left and right along the score.

## Practice settings

| Group | Setting | Description |
| --- | --- | --- |
| Display | Show note results in real time | On by default |
| Display | Cover waterfall | Off by default. When on, a background image covers the waterfall so you practice only by ear and from the score |
| Volume & tempo | Score volume | 0–100, default 100 |
| Volume & tempo | Virtual piano volume | 0–100, default 100. The sound of the keys you press, adjusted separately from the score volume. When the score volume is 0, your keys are muted too |
| Volume & tempo | Metronome volume | 0–100, default 80. The count-in also uses this volume |
| Volume & tempo | BPM | 40–240; the default is the score's tempo |
| Volume & tempo | Metronome during playback | Off by default. When on, the metronome keeps playing throughout practice |
| Staff selection | Staff 1, 2… | All on by default. When you turn a staff off, it is dimmed and **neither judged nor played** |
| Difficulty | Beginner / Intermediate / Master | Beginner by default; see the table above for the judging windows |

Practice mode has no "left hand / right hand" option. In piano scores the first staff is usually the right hand and the second the left hand, so you can use "Staff selection" to practice just one hand.

Settings are kept until you close the app and return to their defaults when you open it again.
