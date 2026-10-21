Edit mode is where you write and revise scores. There are two ways to enter it:

- In "My scores", click "New score" and choose a template;
- In Play mode, click "Edit mode" in the bottom toolbar.

## Interface layout

- **Top left**: the toolbar for adding notes, e.g. whether to add a note or a rest, the duration, and so on. Its contents change with the score type.
- **Top right**: function buttons; see [Top toolbar](#edit-top).
- **Center**: the score itself. Click an element on the score to select it.
- **Right**: the properties panel, which shows the editable properties of the selected element. You can select measures, notes, rests, ties/slurs, symbols, octave lines, volta brackets, braces, and more; when nothing is selected, a hint is shown.
- **Bottom**: three buttons — "Back", "Play mode", and "Score-audio sync".

## Basic workflow

1. **Select a measure**: click a measure. Once it is selected, you can start adding notes.
2. **Add notes**: click with the mouse inside the selected measure, or enter notes with the computer keyboard or a MIDI keyboard. For the methods for each score type, see [Staff editing](#edit-staff), [Number notation](#edit-number), [Drum kit score](#edit-drum), and [Tab](#edit-tab).
3. **Modify**: click a note or other element to select it, then change it in the properties panel on the right, or drag it directly on the score.
4. **Save**: click "Save" in the top-right corner.

## Undo and redo

- `Ctrl+Z` undoes, and `Ctrl+Y` or `Ctrl+Shift+Z` redoes. Edit mode has no undo button; you can only use the shortcuts.
- Up to about 20 steps are kept, and the undo history is cleared when you leave the edit page.
- After an undo or redo, the previously selected measure stays selected if it still exists.
- While the cursor is in an input box (such as the title or lyrics), these shortcuts act on the input box itself.

## Saving

- You can only save by clicking the "Save" button in the top-right corner; there is no save shortcut.
- The score's name is taken from its title; if the title is empty, it is saved as "Untitled score".

> **Note**: you are **not** prompted to save when you leave the edit page. Switching to "Play mode" carries your current changes along, so you can listen first and come back, but your changes are only actually written to "My scores" when you click "Save".

## Shortcut reference

Single-key shortcuts don't work while you hold Ctrl / Alt or while you're typing in an input box. The "Notice" button in the top-right corner also contains the full description.

| Key | Action | Score types |
| --- | --- | --- |
| `Esc` | First clears the box selection, then deselects | All |
| `Delete` / `Backspace` | Deletes the current selection (note, measure, staff, symbol spanning notes, etc.) | All |
| `Backspace` (measure selected) | Removes only the measure's last note / rest and keeps the measure; use `Delete` to remove the whole measure | All |
| `<` (or `,`) / `>` (or `.`) | With a note selected (or a measure — its last note, no need to click the note first): `>` adds a slur from the current note to the next one, or, if the current note already starts a slur, extends that slur one note to the right; `<` adds a slur from the previous note to the current one, or, if the current note already ends a slur, extends that slur one note to the left | All |
| `/` | Removes every slur that starts or ends on the selected note (or the measure's last note) | All |
| `{` (or `[`) | With a measure selected, cycles the front barline: none → start repeat → reverse | All |
| `}` (or `]`) | With a measure selected, cycles the back barline (single, double, end repeat, dashed, final, dotted, heavy, heavy double: 8 types) | All |
| `Ctrl+Z` | Undo | All |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo | All |
| `↑` `↓` `←` `→` | With a measure selected, moves to the adjacent measure above, below, left, or right | All |
| `*` | Adds a single staff below the current single staff; if nothing is selected, it is added at the end | All |
| `-` | Adds a grand staff below the current grand staff; if nothing is selected, it is added at the end | All |
| `Space` | With a measure that has notes selected, opens the rhythm pattern popup; see "Rhythm pattern input" below | All |
| `P` | With a measure selected, copies its notes into the next measure (replacing the notes already there) and selects that measure; press repeatedly to keep copying forward. At the end of a line, it goes to the first measure of the same single staff in the next grand staff | All |
| `1`–`8` | Switches the duration: whole, half, quarter, eighth, sixteenth, thirty-second, sixty-fourth, one-hundred-twenty-eighth | Tab, drum (drum scores only have 3–8; number notation and staff use the numeric keypad) |
| `0` | Toggles "Note / Rest" | Drum, tab (number notation and staff use numeric keypad 0) |
| Main keyboard `1`–`7`, `0` / `~` / `I` / `K` | Adds middle do–si / a rest directly at the end of the measure | Number notation, staff |
| `Q`–`U` / `A`–`J` / `Z`–`M` | Adds high / middle / low 1–7 at the end of the measure | Number notation, staff |
| Main keyboard `8` / `9` | Lowers / raises the toolbar octave dots by one (-3 to +3) | Number notation |
| `A`–`T` (skipping `P`) | Adds the corresponding drum note at the end of the measure | Drum |
| `A`–`Z` (skipping `P`) | Switches the fret 0–24; also writes it when the mouse is inside the measure | Tab |
| MIDI keyboard | With a measure selected, play a key to add a note at the end of the measure | Staff, number notation |

## Rhythm pattern input

Enter the pitches of a measure first (any durations), then re-time them all at once:

1. Select the measure and press `Space` to open the rhythm pattern popup.
2. The popup arranges the measure's pitches into as many rhythm patterns as it can for the time signature in effect (combinations of two eighths, four sixteenths, eighth + two sixteenths, short syncopation, dotted rhythms, long syncopation, long notes and more). Each card is one pattern that exactly fills the measure. The most common ones come first, up to 60 cards.
3. Press the key on a card (main-keyboard digits, letters, then the numpad digits and `.` `+` `-` `*` `/`, shown on cards as `Num1`, `Num+`, etc.) to apply it; or move with the arrow keys and press `Enter` or `Space`, or click a card. Keys are assigned in display order, so cards near the end may have no key; pick those with the arrows or the mouse. Hovering over a card does not change the highlighted candidate.
4. Press `Esc` to close the popup.

Switch between two modes with "Rhythm patterns" at the top of the editor (or press `Tab` while the popup is open). The default is "By beat", and your choice is remembered:

- **By measure**: the behavior described above; the whole measure is re-timed to the chosen pattern.
- **By beat**: only the notes at the end of the measure are grouped into one beat, which suits grouping as you enter notes.
  - Starting from the last note and going back, it stops at the first note that carries a "group end" mark; the notes after that mark are the ones being grouped.
  - Once you pick a pattern, the last note of the group gets the mark. For example, enter 1 2 3 and press `Space`: 3 is marked. If you don't like the result, press `Space` again to regroup 1 2 3. Then enter 4 5 and press `Space`: only 4 5 are grouped.
  - If there are more notes than one beat can hold, only the last ones that fit are used (at most 16 sixty-fourth notes when the quarter note gets the beat); the earlier notes are left out and the popup says so. For example, 111122223333444455556666 groups only 3333444455556666, and the cards offer both a single beam over the whole beat and a split at the half beat into two beams, 33334444 and 55556666.
  - The group end mark shows in the "Rhythm" group of the note / rest property panel, where you can switch it off so the next grouping passes over it. Grouping by measure does not touch these marks.

- Compound meters such as 6/8, 9/8 and 12/8 are grouped by dotted-quarter beats.
- If there are too many or too few notes to fill the measure, the popup says no pattern fits.
- Only durations, dots and beams change; pitches, lyrics, slurs and so on stay. Use `Ctrl+Z` to undo.
- On drum scores the two voices are independent: patterns are based only on the toolbar's current voice, and the previews show only that voice. Nothing opens if the current voice is empty. No note is longer than a quarter.
- Triplets are not supported yet.

## Standard mode

"Standard mode" is a toggle at the top right of the editor, and your choice is remembered. When it is on:

- If a note entered with the keyboard, mouse, or a MIDI keyboard makes the measure's total duration exceed its time signature, that note is moved to the end of the **next measure**, which gets selected; the rest of the current measure is filled with rests.
- If a note is longer than a whole measure (for example, a whole note in 2/4), "Invalid note duration" is shown and the note is not written.
- "Next measure" follows the `→` key: at the end of a line, it is the first measure of the same single staff in the next grand staff. If you are already in the last measure, a hint is shown and nothing is written.
