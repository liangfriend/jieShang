This page explains how to add, change, and delete notes and rests in staff notation.

## Adding with the mouse

1. Click a measure to select it.
2. Move the mouse into the measure (up to 50 pixels above or below it also works, which makes it easy to add notes on ledger lines). A semi-transparent **preview note** appears; its height is the pitch that will be added.
3. Click to add the note. The duration comes from the toolbar in the top-left corner.

Where the note is added depends on where you click:

- Click **between two notes**: inserts a new note.
- Click **on an existing note** at a different height: stacks a note on top of it to form a **chord**; the duration and beam follow the existing note.
- Click on an existing note at the same height: selects that note instead.
- Rests can only be inserted between notes; they cannot be stacked.

Newly added notes have no accidental. The stem direction is set automatically (down when the note is above the middle line, otherwise up).

## Adding with the keyboard / MIDI keyboard

- With a measure selected, press a key on a MIDI keyboard to add a note of that pitch at the end of the measure. The pitch is converted automatically according to the measure's clef and key signature; when an accidental is needed, it is written as a sharp.
- With a measure selected, press main-row `1`–`7` or the three letter rows `Q`–`U` / `A`–`J` / `Z`–`M` to append a note by solfège to the end of the measure; `0` / `~` appends a rest, and the numpad digits switch the duration. See the shortcuts in [Staff editing](#edit-staff).

## Changing pitch: dragging

After selecting a note, hold the note head and **drag it up or down** to change its pitch. If the same chord already has a note head at the target position, the drag has no effect.

## Note property panel

Click a note to select it. The right side shows "Note properties", split into three tabs: "Basics", "Marks", and "Lines". The tab you used last is remembered.

### Basics

**Rhythm**

- **Duration**: 1 / 1/2 / 1/4 / 1/8 / 1/16 / 1/32 / 1/64 / 1/128.
- **Dot**: None / · / ·· / ···.
- **Beam**: Combined / Right only / None. Controls how eighth notes and shorter are joined to neighboring notes with beams.
- **Stem direction**: Up / Down.

**Pitch**

- **Accidental**: None / Sharp ♯ / Flat ♭ / Double sharp 𝄪 / Double flat 𝄫 / Natural ♮. Once set, a "Horizontal offset" slider appears for fine-tuning the accidental's horizontal position.
- **Clef before note**: None / Treble clef / Bass clef / Alto clef / Tenor clef. Temporarily changes the clef before this note; its horizontal offset can also be adjusted.

**Horizontal offset**: a slider from -40 to 40 for fine-tuning the horizontal position of the whole note.

**Grace notes**

- Click "Add grace before" or "Add grace after". A new grace note is an eighth note by default, and its pitch and stem direction follow the main note.
- The list below shows existing grace notes, which you can delete one by one.
- Click a grace note on the score to select it on its own. The property panel changes to "Grace note properties", where you can change the duration, beam, stem direction, and dot.

### Marks

Add single-note marks such as accents, staccato, trills, and dynamics. See [Other symbols](#edit-symbols).

### Lines

Add spanning marks such as arpeggios, slurs, pedals, 8va / 8vb, trill lines, and crescendos / diminuendos. See [Other symbols](#edit-symbols).

## Rest property panel

When a rest is selected, two tabs are shown, "Basics" and "Marks". You can change the duration, dot, and horizontal offset, and add marks.

## Deleting

- Select the item and press `Delete` or `Backspace`.
- If a chord has several notes, only the selected one is deleted; when you delete the last one, the whole note position is removed.
- Slurs and other marks attached to the deleted note are cleaned up as well.

## Multiple voices

Staff notation currently has no voice switching. Multiple notes at the same position are stacked as a chord.
