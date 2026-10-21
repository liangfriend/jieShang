This page explains how to add, change, and delete notes and rests in a drum kit score.

## Adding with the mouse

1. Click a measure to select it.
2. In the toolbar at the top left, choose the voice, note head, duration, and dot.
3. Move the mouse into the measure. A semi-transparent **preview note** appears; move up or down to choose the position (line or space).
4. Click to add the note.

Where the note goes depends on where you click:

- **Between two notes**: inserts a new note.
- **On an existing note** but at a different position: stacks another note head at the same moment, for example snare and hi-hat played together.
- On an existing note at the same position: selects that note head instead.
- Rests can only be inserted between notes.

Notes are only inserted or stacked in the currently selected voice.

## Adding with the keyboard

With a measure selected, press a letter key from `A`–`T` (skipping `P`) to add the matching drum note at the end of the current voice. See the table in [Drum kit score](#edit-drum).

## Changing the position: drag

After selecting a note head or rest, **drag it up or down** to move it to another line or space.

## Note property panel

After you select a note head, the right side shows "Note properties". As in standard notation, it is split into three tabs: "Basics", "Marks", and "Lines".

### Basics

| Item | Description |
| --- | --- |
| Note head | Normal, Cross, Circled cross, Circled slash, Triangle, Diamond |
| Staff position | The position as a number: 0 is the first line (the bottom line), each line or space up adds 1, and 8 is the fifth line (the top line). Range: -6 to 14 |
| Duration | Quarter note to 128th note. This changes the whole note (all note heads at the same moment) |
| Dot | None / Single dot / Double dot |
| Beam | Combined / Right only / None |
| Grace notes | Add grace notes before or after. They use the same note head and staff position as the main note |

When you change "Note head" or "Staff position", check the legal notes table in [Drum kit score](#edit-drum). Combinations not in the table make no sound during playback.

### Marks

Add single-note marks such as accents, staccato, and dynamics to the selected note head. See [Other symbols](#edit-symbols).

### Lines

Add spanning marks such as arpeggios, prelude brackets, slurs, pedals, 8va / 8vb, trill lines, and crescendos / diminuendos. See [Other symbols](#edit-symbols). Only notes in the same voice are counted to the right.

## Rest property panel

When a rest is selected, two tabs are shown, "Basics" and "Marks".

| Item | Description |
| --- | --- |
| Duration | Quarter note to 128th note |
| Dot | None / Single dot / Double dot |
| Staff position | -6 to 14. Click "Center" to put the rest back on the third line |

## Deleting

- Select the item and press `Delete` or `Backspace`.
- When several note heads share the same moment, only the selected one is deleted.
