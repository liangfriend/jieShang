This page explains how to add, change, and delete notes in tab.

## Adding with the mouse

1. Click a measure to select it.
2. In the toolbar at the top left, choose the type, duration, and fret.
3. Move the mouse into the measure. A semi-transparent **preview** appears; move up or down to choose the string.
4. Click to add it.

Where it goes depends on where you click:

- **Between two notes**: inserts a new note.
- **On an existing note** but on another string: stacks another note at the same moment to form a chord.
- On an existing note on the same string: selects it instead.
- Arpeggios, strums, and rests can only be inserted between notes.

## Changing the string: drag

After selecting a fret number, **drag it up or down** to move it to another string.

## Note property panel

After you select a fret number (or an arpeggio or strum), the right side shows "Note properties". As in standard notation, it is split into three tabs: "Basics", "Marks", and "Lines".

### Basics

| Item | Description |
| --- | --- |
| Chord diagram | Choose a chord diagram from "Chord manager" to show above the note; choose "None" to remove it. Only chords matching the current number of strings are listed: 4-string tabs list 4-string chords, 5-string tabs list 5-string chords, and 6-string tabs list 6-string chords |
| Fret | x, 0–27. Only notes and harmonics have this item |
| Start string / End string | Only arpeggios and strums have this item |
| Duration | Whole note to 128th note. All notes at the same moment change together |
| Dot | None / 1 / 2 / 3 dots. All notes at the same moment change together |
| Beam | Combined / Right only / None |
| Slap | Check it to mark the note as a slap |
| Bend | Only notes and harmonics have this item; see below |
| Grace notes | Add grace notes before or after (notes and harmonics only) |
| Horizontal offset | Slider from -40 to 40 to nudge the note left or right; "Reset position" sets it back to 0 |

### Marks

Add single-note marks such as accents, staccato, trills, and dynamics to the selected note. See [Other symbols](#edit-symbols).

### Lines

Add spanning marks such as arpeggios, strums, prelude brackets, slurs, pedals, 8va / 8vb, trill lines, and crescendos / diminuendos. See [Other symbols](#edit-symbols).

Chord diagrams come from the chords saved in [Chord manager](#chords), where you can also create your own. When a chord diagram is placed in a score, a copy is made, so later changes in Chord manager do not affect chord diagrams already placed in the score.

### Bend

After you click "Add bend", you can set:

- **Type**: Bend, Bend and release, Pre-bend, Pre-bend and release, Pre-bend and bend.
- **Stage 1**, **Stage 2**: the bend amount for each of the two stages, from 0 to 3 in steps of 0.5.
- Click "Remove bend" to delete it.

You can also select a bend by clicking its curve on the score; the property panel shows the same settings, plus:

- **Offset**: X / Y inputs to fine-tune the position of the whole bend curve.
- **Reset position**: restore the default position.
- **Delete**: delete this bend.

## Slur types

Click a slur on the score to set its type:

| Type | Meaning |
| --- | --- |
| None | A regular slur |
| Hammer-on H | A left-hand finger strikes the string directly to sound the next note |
| Slide S | Keep the string pressed and slide to the next fret |
| Pull-off P | A left-hand finger plucks the string to sound the next note |
| Hammer-on/pull-off HP | A combination of hammer-on and pull-off |

The other settings are the same as for staff slurs: thickness, range (including "Reset alignment"), start / end notes in chords, end positions, center control point, and "Apply current position to" other slurs in the measure / staff / grand staff / whole score.

## Deleting

- Select the item and press `Delete` or `Backspace`.
- When several notes share the same moment, only the selected one is deleted.
