Tab is a notation made specifically for guitar, ukulele, and bass: each horizontal line stands for a **string**, and the number on a line shows which **fret** to press. Guitar tab has 6 lines, ukulele tab and 4-string bass tab have 4 lines, and 5-string and 6-string bass tabs have 5 and 6 lines respectively.

## Add toolbar

| Item | Options | Default |
| --- | --- | --- |
| Add | Note / Harmonic / Arpeggio / Strum / Rest | Note |
| Duration | Whole note to 128th note | Quarter note |
| Fret | x, 0–27 (shown only for Note and Harmonic). x means a muted note | 0 |
| Start string / End string | Sliders (shown only for Arpeggio and Strum) that set which strings the arpeggio or strum covers | All strings |

- **Note**: a regular fretted note, shown as its fret number.
- **Harmonic**: the fret number is shown in a dedicated harmonic style.
- **Arpeggio**: a vertical wavy line, meaning several strings are plucked one after another.
- **Strum**: a vertical straight line, meaning several strings are swept in a single stroke.

> The number in "Start string" and "End string" is the string number: 1 means string 1, the thinnest string.

## Shortcuts

| Key | Action |
| --- | --- |
| `1`–`8` | Changes the duration: 1 whole note … 8 128th note |
| `0` | Toggles between "Note" and "Rest" |
| `A`–`Z` (skipping `P`) | Enters frets in alphabetical order: A is fret 0, B is fret 1 … O is fret 14, Q is fret 15 … Z is fret 24. `P` is "copy to next measure" |

How the letter keys work:

- **A measure is selected and the mouse is over it** (a translucent preview appears): the toolbar's "Fret" setting changes, and that fret is written at the preview, just like clicking with that fret. If that string already has a note in the previewed column, its fret is replaced. The measure stays selected, so you can move the mouse and keep typing.
- **Otherwise** (no measure selected, or the mouse is outside the measure): only the toolbar's "Fret" setting changes.
- Letter keys also work while an input method is active.

Tab does not support MIDI keyboard input. For general shortcuts, see [Edit mode](#score-edit).

## Tab limitations

- The only measure properties are the brace, trailing barline, leading clef (TAB clef only), and time signature; see [Measures](#edit-measure).
- The tone is determined by the score type (nylon guitar for guitar and ukulele, acoustic bass for bass) and cannot be changed. Tab cannot be converted to other score types.
- Tab cannot enter Practice, Beginner, or Singing mode; it can only be played.

## Adding and editing notes

See [Notes](#edit-tab-note).
