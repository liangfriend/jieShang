The Teaching whiteboard is a "piano that writes its own score": play the piano at the bottom, and the notes you play are written onto the staff above automatically. It's handy for explaining intervals, chords, and key signatures in class, or for letting students see exactly what they played.

## Layout

- **Top**: a set of staves joined by a brace. In "3 rows" mode there is a treble clef, alto clef, and bass clef row from top to bottom; in "2 rows" mode there is a treble and a bass clef row, like a piano grand staff, with exactly enough room between them for middle C's ledger line.
- **Middle**: the piano keyboard.
- **Bottom**: the toolbar.

## How to use it

- Click keys with the **mouse**, or play on a **MIDI keyboard** or the **computer keyboard**; either way, the key sounds and lights up. For the computer keyboard layout, see "Playing with the computer keyboard" in [Practice mode](#play-practice).
- When "Add notes" is on (it is by default), a note is written to the staff the moment you **release the key**.
- How long you hold a key sets the note value: it is converted using "BPM" and rounded to the nearest note value (whole note down to 256th note, with no dots). For example, at BPM 120, holding a key for 0.5 seconds gives a quarter note, and 1 second gives a half note.
- In 3-row mode, notes are written in order on the row selected under "Clef".
- In 2-row mode there's no clef to choose: middle C (C4) and above go to the treble staff, lower notes go to the bass staff. Stems point up on the treble staff and down on the bass staff. The other row gets a rest of the same value at the same time, so both rows stay in playing order.
- Keys pressed at almost the same time are stacked into a chord; in 2-row mode, a chord that spans both rows is written in the same column on each row.
- Black keys are spelled according to the key signature: C major and sharp keys use sharps, and flat keys (F, B♭, etc.) use flats. Accidentals already in the key signature are not repeated.

## Toolbar

| Button | Description | Default |
| --- | --- | --- |
| Keys | 88 keys, 76 keys, 61 keys, 54 keys, 49 keys. MIDI notes outside the range are ignored | 88 keys |
| Height | Key height, 80–280 pixels | 96 |
| Width | "Fill screen" or "Custom" | Fill screen |
| White key | 20–72 pixels; adjustable only when the width is "Custom" | 36 |
| Pitch | Shows note names on the keys: None / Helmholtz (e.g. c¹) / Scientific (e.g. C4) | None |
| Tone | The tones you own in your Collection | Piano |
| Volume | 0–100% | 100% |
| Grouping | Colors each octave differently and labels the octave names above the keys: the octave containing middle C (C4) is Small octave 1; going down, the next ones are Small octave, Great octave, and Contra octave, and the lowest keys, A0–B0, are Subcontra octave | Off |
| Chord slider | See below | Off |
| Interval slider | See below | Off |
| Add notes | Whether notes are written to the staff as you play | On |
| Auto clear | Clears the notes on the staff before each new key press; useful for showing one note or one chord at a time | Off |
| Staves | 3 rows / 2 rows. Switching clears the notes on the staff | 3 rows |
| Clef | Which row notes are written to: Treble clef / Alto clef / Bass clef. Available only in 3-row mode; grayed out in 2-row mode | Treble clef |
| BPM | 30–300; only used to convert note values, nothing is played | 120 |
| Key signature | Opens the circle of fifths; see below | C |
| Shortcuts | Shows the computer keyboard key map, where you can set the octave of the letter keys and the numpad separately | |
| Clear notes | Clears all notes on the staff | |

Toolbar settings (including "Staves", "Auto clear" and "Key signature") are saved automatically and restored the next time you open the whiteboard. Notes on the staff are not saved and are cleared when you leave the page. You also can't delete a single note; you can only remove everything with "Clear notes".

## Circle of fifths

Click the "Key signature" button to open the circle of fifths. Click the button again, or the × in the window's top-right corner, to close it. Drag the window's title bar to move it anywhere; it reopens in the same place.

- The **outer ring** shows the major keys. C is at the top; each step clockwise adds a sharp, each step counterclockwise adds a flat. Each cell also shows the number of accidentals (e.g. 2♯).
- The **inner ring** shows the relative minor key (e.g. Am for C), which has the same key signature.
- The three positions at the bottom, B / C♭, F♯ / G♭ and C♯ / D♭, are enharmonic keys. Their cells are split into an outer half (sharp spelling) and an inner half (flat spelling).
- Click any cell to switch to that key signature. The current key is shown in green, and the center shows its name, its number of accidentals and its relative minor.
- Switching changes all rows at once; existing notes keep their pitch, and their spelling is adjusted.

## Chord slider

When it's on, a slider that you can drag left and right appears on the keyboard:

1. Choose a chord type from the dropdown (26 types; Major triad by default).
2. Drag the slider to the position you want. The key under the slider's **left edge** is the root of the chord.
3. Hold the "Play" button on the slider: the whole chord sounds and lights up at once, and is written to the staff (if "Add notes" is on).

## Interval slider

When it's on, a "ruler" that you can drag left and right appears on the keyboard. Its marks, from 1 to 15, show the interval between each note and the starting point (e.g. ♭3, 5). Hover over a mark to see the interval name (e.g. "Perfect 5th"). It's for reference only and makes no sound.
