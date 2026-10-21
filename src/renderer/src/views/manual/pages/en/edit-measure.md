The measure is the basic unit for entering notes: **select a measure first, then add notes**.

## Selecting a measure

- Click a measure to select it. Once selected, you can add notes to it. For how to add notes, see the "Notes" page for each score type.
- While a measure is selected, use the arrow keys to move to the adjacent measure: left and right move to the previous and next measure, up and down move to the single staff above or below in the same grand staff.
- Press `Esc` to clear the selection.

## Adding and deleting measures

Measures are always added and deleted **as a whole column**: when you add or delete a measure in a grand staff, every single staff in that grand staff is updated at the same time, so all staves keep the same number of measures.

Ways to add a measure:

- "Insert before" and "Insert after" in the "Measure" group of the property panel;
- The right-click menu "Add measure ▸ Left / Right";
- With "Structure" turned on, the green "→" button below a single staff adds a column of measures at the end of the grand staff.

To delete a measure, select it and press `Delete`, or right-click and choose "Delete". If deleting would leave a single staff with no measures at all, the deletion is not allowed.

## Measure property panel

When a measure is selected, the property panel on the right shows the following groups:

### Measure

- "Insert before" and "Insert after".
- **Bracket type**: None / Bracket / Brace / Square. Sets the symbol on the left of the grand staff that connects its single staves.

### Barlines

- **Leading barline**: None, Repeat start, Reverse barline. With a measure selected, press `{` (or `[`) to cycle; the property panel also has "None".
- **Trailing barline**: Single barline, Double barline, Repeat end, Dashed barline, Final barline, Dotted barline, Heavy barline, Heavy double barline. With a measure selected, press `}` (or `]`) to cycle.

### Measure start

Add or change the following at the start of the measure:

- **Clef**: Treble / Bass / Alto / Tenor. Number notation has no clef; tab only has the TAB clef (see below).
- **Key**: 15 major keys. Only staff notation can set a key signature.
- **Time**: available for all score types.

### Measure end

Add a clef, key signature, or time signature at the end of the measure (as a courtesy for a change starting in the next measure). Only staff notation has all three; drum kit scores only have the clef.

### Repeats

- **Start repeat**: Segno, Coda.
- **End repeat**: Fine, D.C., D.S., To Coda, D.C. al Fine, D.C. al Coda, D.S. al Fine, D.S. al Coda.
- **Volta**: use the 1–5 buttons to choose how many measures it covers, starting from the current measure. A new volta's text defaults to "1.", meaning it is played on the 1st pass. Adding fails if there are not enough measures after it or it overlaps an existing volta. When a volta already exists, click "Remove volta". For the volta's detailed properties, see [Other symbols](#edit-symbols).

### Measure properties in tab

Tab measures only have: bracket type, trailing barline, leading clef (TAB clef only), and leading time signature.
