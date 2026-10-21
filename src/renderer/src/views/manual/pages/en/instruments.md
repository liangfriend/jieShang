The Instrument simulator lets you play a variety of instruments with your computer keyboard and mouse. Click "Instruments" on the home screen and choose an instrument.

| Instrument | How to play |
| --- | --- |
| Guitar | Number keys for chords, numpad to pick strings |
| Harmonica | Follows the mouse; left-click to blow / right-click to draw |
| Pan flute | Mouth position follows the mouse; left-click to blow |
| Piccolo | Cover holes with the keyboard; blow into the microphone or use Space to sound |
| Kalimba | Play with letter keys; left and right hands match the left and right tines |
| Drum machine | Multi-track step sequencer; save and load patterns |

- The Instrument simulator **doesn't support MIDI keyboards**.
- Every instrument page has a "Guide" in the top-right corner.
- "Xiao" is still in development and can't be opened yet.
- The guitar, harmonica, pan flute, piccolo, and kalimba each require owning the matching tone in your Collection; all of them are owned by default.

## Playing along with a score

The guitar, harmonica, pan flute, piccolo, and kalimba pages all have a score panel at the bottom: pick one of your "My scores" in "Select score", then click "Play", "Pause", or "Stop" to listen and play along.

## Guitar

A six-string guitar in standard tuning (E A D G B E) with 20 frets. At the top, the guitar is on the left and the current chord's diagram is on the right; at the bottom left is the score area, and the bottom-right panel holds score playback and the guitar settings below.

- **Horizontal / Vertical**: the toggle to the left of "Guide" at the top. "Horizontal" is the default, with the guitar lying across the top; "Vertical" stands the guitar on the left, moves the chord diagram above it, and gives the whole right side to the score area. Your choice is remembered.
- **Chord & lyric sheet**: below "Select score" in the panel, you can also pick a [chord & lyric sheet](#cl-sheet) to show in the score area. If a score is selected too, the single-line score sits on top and the sheet below; with only a sheet selected, it fills the score area. Scroll up, down, left, or right when it does not fit.

- **Fretting chords**: Hold number key `1`–`9` on the main keyboard and the left hand frets the corresponding chord; release to return to open strings. The defaults, in order, are C, G, Am, Em, D, F, E, A, Dm. Fretted strings turn orange, the pressed fret glows, and an orange badge below the neck shows the fret number; the highlight brightens when you pick that string.
- **Picking**: Numpad `1`–`6` (1 is string 1, the thinnest), or click a string with the mouse. Muted (×) strings don't sound.
- **Chord shortcuts**: Change the chords bound to `1`–`9`; chords come from the 6-string chords in the [Chord manager](#chords).
- **Manage chords**: Opens the Chord manager page.
- The bottom-right panel shows the name of the "Current chord", and its chord diagram appears to the right of the guitar.
- **Smooth**: Makes the sound softer; off by default.

## Harmonica

- The harmonica follows the mouse left and right; only the holes inside the red mouth box sound.
- Hold the **left button to blow** and the **right button to draw**.
- **Model**: "10-hole C blues" or "24-hole C tremolo" (default).
- **Mouth size**: How many holes the mouth box covers, 0.5–8.
- **Smooth**: Off by default.

## Pan flute

- Move the mouse so the red arrow points at a pipe, and hold the **left button to blow**. Slide while holding the left button to change notes continuously. Only one pipe sounds at a time.
- **Model**: "16 pipes, C" (default, G4–A6) or "18 pipes, C" (G4–C7).
- **Smooth**: On by default.

## Piccolo

A six-hole piccolo in G.

- **Covering holes**: With the head facing left, hold `Q` `W` `E` `P` `O` `I` to cover the six holes and `A` `S` `D` `L` `K` `J` to half-cover them; with the head facing right, use `O` `I` `U` `Q` `W` `E` to cover and `L` `K` `J` `A` `S` `D` to half-cover. You can also use the mouse: left-click to cover a hole, right-click to half-cover it.
- **Breath**:
  - "Mic" (default): The microphone turns on when you open the page; blow into it to make a sound. The harder you blow, the louder the sound; when one fingering can produce different octaves, the faster the breath, the higher the note. The "Pressure" bar next to it shows the current breath pressure.
  - "Space": Hold the Space key to make a sound; only the lowest octave plays.
- The right side shows the current note name and register. When a fingering doesn't match any note, it shows "No note for this fingering".
- If the microphone won't turn on, check the microphone permission or switch to "Space" mode.

## Kalimba

- **Model**: "17 tines, C" (default, C4–E6) or "21 tines, C" (F3–E6).
- The lowest note is right in the middle, on the `G` key, and pitches rise alternately toward each side: the left side goes `F` `D` `S` `A` `T` `R` `E` `W` `Q` `B` in order, and the right side goes `H` `J` `K` `L` `Y` `U` `I` `O` `P` `N`.
- You can also hold a tine down with the left mouse button.
- **Smooth**: On by default.

## Drum machine

Arrange drum patterns on a grid and save them to reuse again and again.

- Each row is a track (one drum sound), and each cell is a point in time. **Left-click to light a cell, right-click to turn it off, and drag while holding to paint continuously.**
- There are 9 tracks by default and up to 24; use "Add track" at the bottom. Each track has "Preview", "Solo" (S), and "Mute" (M); "More" contains regridding the whole track, "Invert", "Clear track", and "Remove track".
- Settings:

| Setting | Range | Default |
| --- | --- | --- |
| BPM | 40–240 | 110 |
| Volume | 0–100% | 50% |
| Swing | 0–60%; gives the rhythm a bit of a "lilting" feel; you can choose which note unit it applies to | 0 |
| Length (beats) | 1–64 beats | 8 beats |

- At the top you can use "New", "Open", "Save", and "Save as", and give the pattern a name. When there are unsaved changes, "Unsaved" is shown, and you'll be reminded before you leave.
- Shortcuts: `Space` to play / stop, `Ctrl+S` to save, `Ctrl+Shift+S` to save as.
