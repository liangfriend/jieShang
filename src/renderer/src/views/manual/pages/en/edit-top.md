In Edit mode there are two groups of buttons in the top-right corner, plus a toolbar along the bottom. While a file is being read or written, these buttons are temporarily disabled.

## First group of buttons

### Layout

Opens the "Layout" dialog, which has two parts:

- **Current score layout**: adjusts the current score's page (total width, left margin, instrument name font, right margin, total height), title area (height, font), lyrics (font, font size; lyrics are drawn inside the single staff's outer bottom margin and take up no height of their own), grand staff margins (top / bottom), and single staff margins (outer top / inner top / inner bottom / outer bottom), with a preview alongside. Changes are written to the current score immediately. Click "Sync as default" to make the current layout the software's default layout.
- **Default layout**: the software's default layout. Changes are saved automatically and affect scores you create later and staves you add later. Click "Apply" to apply it to the current score. Total width and total height are not part of the default layout.

For what each area means, see [Score structure](#edit-structure).

### Structure

A toggle. When it's on, buttons for adding and removing structure appear on the score:

| Position | Button | What it does |
| --- | --- | --- |
| Below the grand staff, left side | Red "− Grand staff" | Deletes this grand staff; unavailable when only one is left |
| Below the grand staff, left side | Pink "+ Grand staff" | Inserts a grand staff after it, reusing the current grand staff's number of single staves, clefs, key signature, time signature, barlines, brace, and tones |
| Bottom right of a single staff | Red "−" | Deletes this single staff; unavailable when it's the only one in the grand staff |
| Bottom right of a single staff | Blue "↓" | Adds a single staff below |
| Bottom right of a single staff | Green "→" | Adds one measure to the end of every single staff in this grand staff |

While a measure is selected, the buttons below single staves are temporarily unavailable. When you turn the toggle off, the buttons are hidden, but the space they occupy is kept.

### Lyrics

A toggle to the right of "Structure". Turn it off to hide the lyrics on the score so you can focus on the notation. The lyrics themselves aren't deleted. It works independently of "Structure".

### Linked staves

A toggle that applies to all grand staves. When it's on, the barlines of the single staves within the same grand staff are joined; when you change or delete a barline, the barlines in the same column change together.

### Show instrument

A toggle. When it's on, each single staff shows its tone name on its left. A single staff's tone is set with "Set tone" in the [Right-click menu](#edit-context-menu). Tabs and drum kit scores have fixed tones and don't have this toggle.

### Score type

Switches between staff notation and number notation. A confirmation appears before switching: "Playback data will be preserved as much as possible, but layout and some notation details may be lost. You can undo this switch with Ctrl+Z." Tabs and drum kit scores can't be converted and don't have this option.

### Transpose

Choose a "Target key", then click "Transpose". Transposing uses the **first key signature** in the score as the current key. If the key changes partway through the score, some notes may end up with the wrong pitch; the confirmation dialog warns about this too. You can't transpose when the target key is the same as the current key.

### Up ½ / Down ½

Raises or lowers the whole score by one semitone. It takes effect as soon as you click, and you can undo it with `Ctrl+Z`.

## Second group of buttons

| Button | Description |
| --- | --- |
| Standard mode | A toggle. When it's on, a note you enter that overflows the measure's time signature is moved to the next measure, which gets selected, and the rest of the current measure is filled with rests; see [Edit mode](#score-edit) |
| Quick input | Number notation only. Enter number notation quickly as text; see [Quick number-notation input](#edit-quick-number) |
| Piano input | Staff notation only. Play on a MIDI keyboard and record it as a piano score; see [Staff input by recording](#edit-piano-record) |
| Legal notes | Drum kit scores only. Lists every note available in drum kit scores and its letter shortcut; see [Drum kit score](#edit-drum) |
| Notice | Opens "Editing notice", which summarizes the rules for selecting and deleting, the shortcuts for each score type, and more |
| Import / Export | See [Import and export](#edit-import-export) |
| Save | Saves the score to "My scores" |

## Bottom toolbar

| Button | Description |
| --- | --- |
| Back | Returns to the previous page; if there is none, returns to the home page |
| Play mode | Switches to Play mode to listen, including any changes you haven't saved yet |
| Score-audio sync | Opens the score-audio sync panel; see [Score-audio sync](#edit-sync) |

Edit mode itself has no play button. To listen, switch to Play mode.
