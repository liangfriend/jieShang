Number notation uses the digits 1–7 for do through si, and dots above or below a digit (octave dots) for higher or lower octaves. It is the easiest notation to get started with. In number notation, pitch is determined by the **digit and its octave dots**, so besides the mouse, typing on the computer keyboard is faster.

## Add toolbar

| Item | Options | Default |
| --- | --- | --- |
| Add | Note / Rest | Note |
| Duration | Whole note to 128th note | Quarter note |
| Octave | -3, -2, -1, 0, 1, 2, 3 (hidden when Rest is selected) | 0 |

The octave value is the number of dots a newly added note gets: positive values are higher octaves (dots above), negative values are lower octaves (dots below), and 0 means no dots.

## Shortcuts

The number keys in number notation work differently from other score types: **the digits and three letter rows on the main keyboard enter notes directly**, and the numpad digits switch the duration.

| Key | Function |
| --- | --- |
| Main keyboard `1`–`7` | Adds middle do, re, mi, fa, sol, la, si at the end of the selected measure, using the toolbar duration |
| `Q` `W` `E` `R` `T` `Y` `U` | Adds high 1–7 in turn (one octave dot above) |
| `A` `S` `D` `F` `G` `H` `J` | Adds middle 1–7 in turn |
| `Z` `X` `C` `V` `B` `N` `M` | Adds low 1–7 in turn (one octave dot below) |
| Main keyboard `0` / `~` / `I` / `K` | Adds a rest at the end of the selected measure |
| Main keyboard `8` / `9` | Lowers / raises the toolbar octave dots by one, from -3 to +3; affects adding with the mouse |
| Numpad `1`–`8` | Switches duration: 1 whole note … 8 128th note |
| Numpad `0` | Toggles between "Note" and "Rest" |
| MIDI keyboard | With a measure selected, press a key to add the corresponding note at the end of the measure, converted to a scale degree and octave dots according to the score's key |

For common shortcuts, see [Edit mode](#score-edit).

> Keys are matched by physical position, so the letter keys also work while your input method is in Chinese mode.

### Keyboard entry example

To enter "5 5 6 5 | 1̇ 7" (the 1 in the second measure is a high note):

1. Select the first measure and press `5` `5` `6` `5` in turn.
2. Press `→` to move to the next measure on the right (or insert a measure from the property panel / context menu, then select it). With "Standard mode" turned on (top right), filling a measure jumps to the next measure automatically, so you can skip this step.
3. Press `Q` to add a high 1, then press `7` (or `J`) to add a middle 7.

## Number-notation-only features

- **Quick input**: write a whole passage of number notation quickly as a line of text. See [Quick number-notation input](#edit-quick-number).
- **Box selection**: raise or lower pitch and change durations in batch. See [Box-selecting notes](#edit-box-select).
- **Convert to staff notation**: "Score type" in the top-right corner. See [Top toolbar](#edit-top).
- Number notation measures have no clef or key signature; only the time signature can be set. The key is set with "1 =" in the title area. See [Score structure](#edit-structure).

## Adding and editing notes

See [Notes](#edit-number-note) for details.
