In Edit mode, right-clicking on the score opens a menu. Measure-related actions in the menu apply to the measure you right-clicked (or the currently selected measure). Clicking outside the menu, pressing `Esc`, or scrolling the page closes the menu.

## Menu items

| Menu item | What it does |
| --- | --- |
| Delete | Deletes the selected content, the same as pressing the `Delete` key |
| Multi-measure rest / Remove multi-measure rest | Drum kit scores only. Turns the whole measure into a multi-measure rest; once set, no more notes can be added to that measure |
| Copy ▸ Measure / Single staff / Grand staff | Copies the content of that scope |
| Paste ▸ Measure / Single staff / Grand staff | Pastes the copied content here, replacing what was there |
| Clear notes | Clears the notes in this measure; unavailable for an empty measure |
| Add measure ▸ Left / Right | Inserts a column of empty measures to the left or right, on every row of the grand staff at once |
| Delete this staff in every grand staff | Deletes the single staff in the same row in **every grand staff** (for example, row 2 of every grand staff). Unavailable if it would leave any grand staff empty |
| Set tone | Sets the playback tone of the single staff. Tabs and drum kit scores have fixed tones and don't have this item |
| Set volume | Sets the playback volume of the single staff; the default is 100 |

## Copy and paste

- Copied content is kept only for the current session and is cleared when you close the software.
- **Copying a measure** copies only the notes, not the lyrics. Pasting replaces the notes in the target measure and removes slurs and other cross-note symbols attached to the original notes.
- **Copying a single staff or grand staff** copies the structure along with the cross-note symbols in it. Pasting replaces the target and automatically matches the number of measures.
- You can only paste into a score of the **same type**; for example, content copied from staff notation can't be pasted into number notation. When the clipboard is empty or the type doesn't match, "Paste" is grayed out.
- Edit mode has no `Ctrl+C` / `Ctrl+V` shortcuts; use the right-click menu to copy and paste.

## Set tone

Choosing "Set tone" opens the tone selection window:

- It sets the tone for the single staff this measure belongs to. The single staves in the same row of the **current and following** grand staves are set at the same time; earlier grand staves are not affected.
- You can search for tones. Tones are grouped by instrument family, and only tones you own are listed.
- Click "OK" to apply, or "Clear tone" to reset it to unset.

After setting it:

- When the tone in Play mode is set to "Score setting", the tone set here is used.
- When you turn on the "Show instrument" toggle at the top, the tone name appears to the left of the staff; see [Top toolbar](#edit-top).

## Set volume

Choosing "Set volume" opens the volume window:

- It sets the playback volume of the single staff this measure belongs to, as a percentage from 0 to 200 (default 100). Unlike tones, the single staves in the same row of **every** grand staff are set at the same time, including earlier ones.
- Drag the slider or type a value, then click "OK" to apply; "Reset to 100" returns to the default.
