A chord & lyric sheet is a "lyrics + chords" sheet for playing and singing: the chord to play is marked above each word, which suits guitar or ukulele strum-and-sing. Unlike staff or number notation, it has no beats or durations — it only records the lyrics and where the chords go.

## Creating and opening

- In "My scores", click "New score" and pick "Empty" in the "Chord & lyric sheet" group to open the editor.
- After saving, it appears in the "My scores" list with a "Chords" badge in the top-left of its card. Click the card to open it.
- The score's name is the sheet's **song title**. If the title is empty, it's saved as "Untitled chord sheet".

## View and Edit

Switch between "View" and "Edit" in the top-right corner:

- **View**: shows only the sheet, for reading while you play. Saved sheets open in View.
- **Edit**: change the title, description, author, lyrics and chords; the Style and Chord text panels appear on the right. The description (such as "1=C 4/4") goes on the left under the title, and the author on the right.

## Writing lyrics and chords

| Action | How |
| --- | --- |
| Add a line | Click "＋ 添加一行" at the bottom of the sheet and type the lyrics; Enter starts a new line |
| Edit a whole line | Double-click the line (or press Enter on a selected word); Enter splits, Backspace at line start merges with the previous line, and you can paste several lines at once |
| Set a chord | Click a word and pick a chord in the popup; you can also set the word's color and underline there |
| Move the selection | Arrow keys move between words, Delete removes the chord, Esc deselects |
| Move a chord | Drag it onto another word; hold Ctrl while dragging to copy |
| Line actions | Hover over a line to show edit, move up, move down, insert and delete buttons on the right |

> To put a chord at the end of a line where there are no more words, type a space at the line end and give the space a chord.

## Chord text

The "Chord text" panel writes chords in square brackets before the word they belong to, for example:

```text
[C]Twinkle, twinkle, [F]little [C]star,
[F]How I [C]wonder [G7]what you [C]are.
```

- The text updates whenever the sheet changes; click "Copy text" to share it.
- Paste chord lyrics you found online and click "Import to sheet" to build the sheet (this replaces all current lyrics and chords).
- `{#e6553a}` before a word sets the lyric color, before a `[chord]` sets the chord color; `{u}` underlines.

## Top score

When playing you often need to see the strumming pattern. In Edit mode, use "Top score" on the right to pick one of your scores from "My scores"; it's added at the top of the sheet.

- Adding a score saves a copy of it into the sheet. Later edits to the original in "My scores", or deleting it, don't affect the copy; to pick up changes, choose the score again.
- Once a score is added, the dropdown replaces it with another one; click "Remove" to take it off.
- The area is short by default. While editing, drag its bottom edge or use the "Area height" slider to resize it; if the content doesn't fit, scroll inside the area.
- "Score zoom" changes how large the score is drawn.
- Turn on "Chord names only" to draw chord diagrams in the score as names only, without the fingering grid, to save space.

## Style

The Style panel adjusts page width, lyric size, line gap, font, lyric color and chord color. These settings are saved with the sheet. Click "Reset" to restore the defaults.

"New lyrics" and "New chords" set the color for text and chords you add from now on, for example to mark a chorus in another color: pick the color, then write. They don't change existing content; when cleared, new content follows the lyric and chord colors above.

## Lyrics with chords

The "Lyrics with chords" panel on the right changes every character that has a chord at once; characters without chords stay as they are:

- **Underline**: turn it on to underline every character with a chord, or off to remove all those underlines. The switch only shows as on when all of them are underlined.
- **Color**: pick a color to apply it to every character with a chord; clear the color to restore the default lyric color. The color picker is empty when their colors differ.

Spaces typed at the end of a line only to hold a chord are not included.

## Saving

Click "Save" in the top-right corner or press Ctrl + S. When there are unsaved changes, "Unsaved" appears next to the heading, and you're asked to confirm before leaving the page.

## Import and export

Chord sheets are imported and exported as `.json` files (not the `.sj` score format), which is handy for backups or sharing.

- **Export**: click "Export" in the top-right corner to save the current sheet as a `.json` file, including lyrics, chords, description, style and the top score. Unsaved changes are exported too.
- **Import**: click "Import" in the top-right corner and pick a `.json` file; its contents replace the current sheet. After importing, "Unsaved" is shown and nothing is stored until you click "Save". To keep it as a separate sheet, create a new blank sheet first and import into that.
