"Quick input" lets you write number notation as text, just like typing, which is handy for entering a whole song quickly. It's available for **number notation** only; open it with the "Quick input" button in the top-right corner of Edit mode.

## Interface

When you click it, the "Number notation quick input" panel opens at the bottom: the "Text" input area is on the left, with parsing hints shown below it, and the "Preview" is on the right. There are four buttons at the top:

| Button | What it does |
| --- | --- |
| Score to text | Converts the current score to text and fills it in on the left, so you can edit on top of an existing score |
| Update preview | Refreshes the preview on the right from the text on the left. Shortcut `Ctrl+S` (only while the panel is open) |
| Apply preview to score | **Overwrites** the current score with the preview, then closes the panel on success |
| Rules | Shows the text syntax rules and an example |

The preview uses the current score's title, key signature, time signature, tempo, beat unit, and page width.

> Text input can't express every symbol (such as accidentals and lyrics). A confirmation appears when you apply, and this information in the current score may be lost after applying. You can still undo with `Ctrl+Z` afterwards.

## Syntax rules

### Structure

- Each line is one single staff.
- Consecutive non-empty lines form one grand staff; a blank line starts a new grand staff.
- Separate notes with spaces.

### Notes

- `1`~`7` correspond to do~si.
- `0` is a rest.
- `X` is a rhythm note (no pitch).
- A dot **before** the digit, `.5`, raises it an octave; a dot **after** the digit, `5.`, lowers it an octave. You can write several dots.

### Duration

- `/` underline: each one halves the duration. `5/` is an eighth note, `5//` is a sixteenth note.
- `-` dash: `5-` is a half note, `5--` is a dotted half note, `5---` is a whole note.
- `,` augmentation dot; you can write several, e.g. `5,`.
- `-` and `/` can't be used together.
- If a measure's total duration doesn't match the time signature, a hint appears in the hints area.

### Combinations

- `5(1)`: stacks another note at the same position. You can chain several, e.g. `5(1)(3)`.
- `[3]5`: grace note before; `5[3]`: grace note after. You can use `/` and octave dots inside grace notes too.
- `<5`, `>3`: the start and end of a slur, written before the note.

### Barlines

- `|` goes at the end of a measure; each space-separated `|` closes one measure.
- `| |` with no notes in front is an empty measure. `1 | | | |` is 4 measures.
- A `|` at the start of a line creates an empty measure, not a leading barline.
- Barlines written together like `|1|2` count as one; the later one overrides the earlier one.
- Add a number after `|` to choose the barline type:

| Syntax | Barline type | Syntax | Barline type |
| --- | --- | --- | --- |
| `\|1` | Start repeat | `\|6` | Dashed |
| `\|2` | End repeat | `\|7` | Dotted |
| `\|3` | Final barline | `\|8` | Reverse final barline |
| `\|4` | Start-end repeat | `\|9` | Heavy |
| `\|5` | Double barline | `\|10` | Heavy double |

### Unsupported content

The title, key signature, time signature, and tempo come from the current score. Accidentals, leading barlines, lyrics, and so on are not supported; they are ignored during conversion and listed in the hints area.

## Example

Below are two grand staves: the first has one line, and the second has two lines (the blank line in between separates the grand staves):

```
5. 4. <7. >6. .5(.6) | .7 .5 .5/ 5- |4

[1/2/]3 3/ 2/ <1, >2/ | 3(5) 0 .1- |2
1 1 5. 5. | 6.(1) 6. 5.- |2
```

## Recommended workflow

1. Open the panel and click "Score to text" to get the current score as text.
2. Edit or keep typing on the left, and press `Ctrl+S` at any time to see the preview.
3. Watch the hints area. Once you've confirmed the preview is correct, click "Apply preview to score".
4. Back in the editor, add the accidentals, lyrics, and other content that text can't express, then save.
