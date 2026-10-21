The Chord manager is where you manage **chord diagrams** (the familiar fretboard fingering charts) for guitar, bass, and ukulele. Chord diagrams saved here can be used in tab scores and the guitar simulator.

How to open it: click "Chord manager" on the home screen, or the "Manage chords" button on the guitar simulator page.

## Chord list

- **Type filter**: All / 6-string (guitar) / 5-string (bass) / 4-string (ukulele).
- **Search**: Type part of a chord name and press `Enter` or click the search button.
- The list is sorted by name. Each card shows the chord diagram, name, and type. Click a card or "Edit chord" to edit it.
- "Delete" first asks you to confirm: Delete chord "name"?

### Built-in chords

Each type comes with 9 common built-in chords: C, G, Am, Em, D, F, E, A, Dm.

- 6-string chords use standard tuning E A D G B E, 4-string (ukulele) chords use G C E A, and 5-string (bass) chords use B E A D G.
- Built-in chords can be edited and deleted just like the ones you add yourself. **Deleted chords are not restored automatically.**

## Adding and editing chords

Click "Add chord" in the top-right corner, or "Edit chord" on a card.

1. **Chord type**: 6-string / 5-string / 4-string. It can't be changed after the chord is created.
2. **Name**: Required, e.g. "Cmaj7".
3. **Frets**:
   - `fretCount`: how many frets the diagram shows, 1–8, default 5.
   - `baseFret`: the starting fret, default 0. For chords higher up the neck (for example, starting at fret 5), enter it here; the "relative fret" values below all count from this fret.
4. **Fretting (stringStates)**: one row per string; "1弦" (string 1) is the thinnest string.
   - State: Hidden / Open (o) / Muted (x) / Fretted (number).
   - Relative fret: which fret you press; 0 means the first fret after the starting fret.
   - text: the text shown inside the dot, usually a finger number (1 index, 2 middle, 3 ring, 4 pinky).
5. **Barres (barres)**: Click "Add barre" to add a barre, then set its relative fret, start and end strings, and the text shown on each string. "Full barre example (F)" quickly loads an F chord for reference.
6. Click **Save**.

A live preview sits above the editing area; use "Preview scale" to zoom in (1–10×).

> Most field names in the editing area are shown in both Chinese and English (e.g. "品数 / Frets"), and a few only in Chinese; just fill them in by following the description above.

### Chord hand pose

Click "Chord hand" to open "Edit chord hand pose" and adjust the hand shape shown in the guitar simulator:

- Drag the blue root points to move the fingers, and drag the orange joint points to rotate them.
- "Reset" restores the initial pose, and "Apply pose" confirms it.

You don't have to set one: a hand pose is generated automatically when you save.

## Where chords are used

- **Tab**: After selecting a note, choose a chord under "Chord diagram" in the property panel; see [Tab notes](#edit-tab-note). A chord diagram is copied when it's placed in a score, so later changes here don't affect chord diagrams that are already in a score.
- **Guitar simulator**: Number keys 1–9 can be bound to chords, and only 6-string chords can be used; see [Instrument simulator](#instruments).
