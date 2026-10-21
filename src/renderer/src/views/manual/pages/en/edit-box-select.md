Box selection lets you select several notes at once to raise or lower their pitch, change their duration, or delete them in one go. Every score type supports box selection; the available batch operations depend on the score type (see the table below).

## How to box-select

- Hold down the left mouse button and drag on an empty part of the score or inside a measure. A purple selection box appears; when you release the button, the notes inside the box are selected.
- You can select note heads in staff notation and drum kit scores, number notation digits, tab fret numbers (plus arpeggios and strums), and rests. Selected items are highlighted in purple.
- You can also start dragging from an empty part of the editing area outside the score. Pressing on an input box, button, or drop-down does not start a box selection.
- A very short drag counts as a normal click and does not box-select.
- After a box selection, any previous single selection is cleared; releasing the mouse does not select a measure or add a note.

## Batch operations

After a box selection, the property panel on the right shows "N notes selected" (if rests are included, the number of rests is shown too) and offers these operations:

| Group | Operation | Description |
| --- | --- | --- |
| Pitch | Lower / Raise | Enter 1–48 semitones and click "Confirm". Rests are not affected by pitch shifts |
| Duration | Duration ×2 / Duration ÷2 | Doubles or halves the duration of all selected notes, within the range of whole note to 128th note. A message appears when the limit is reached |
| Duration | Dot | Sets the same dot for all selected notes |
| Stem | Stem direction | Only shown when the selection includes notes with stems (staff notation) |
| Actions | Delete selected | Deletes all selected notes and rests. You can also press `Delete` or `Backspace` |

- **Drum kit scores**: there are no "Pitch" or "Stem" groups, and the longest duration is a quarter note.
- **Tab**: there are no "Pitch" or "Stem" groups; changing duration or dots changes all notes at the same moment together.

## Clearing a box selection

- Press `Esc` once to clear the box selection, and again to clear the single selection.
- Undoing an action also clears the box selection.

> Box-selected content cannot be copied and pasted. To copy and paste, use the [Right-click menu](#edit-context-menu), which works on whole measures, single staves, and grand staves.
