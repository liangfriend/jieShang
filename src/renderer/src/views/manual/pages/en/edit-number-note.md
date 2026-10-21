This page explains how to add, change, and delete notes and rests in number notation.

## Adding with the mouse

1. Click a measure to select it.
2. Move the mouse into the measure. A semi-transparent **preview digit** appears. The higher the mouse, the larger the digit (7 at the top, 1 at the bottom).
3. Click to add the note. The duration and octave dots come from the toolbar in the top-left corner.

In number notation you can only insert new notes **between two notes**; unlike staff notation, you cannot click on an existing note to stack a chord. To stack several notes at the same position, use "Add voice note" below.

## Adding with the keyboard

With a measure selected, press `1`–`7` on the main keyboard to add a note at the end of the measure, or `0` to add a rest. See the shortcuts on the [Number notation](#edit-number) page for details.

## Changing pitch: dragging

After selecting a note, hold the digit and **drag it up or down** to change its pitch. Dragging past 7 moves on to 1 in the next octave up, and dragging past 1 moves on to 7 in the next octave down; the octave dots change accordingly.

## Note property panel

Click a digit to select it. The right side shows "Note properties", split into three tabs: "Basics", "Marks", and "Lines".

### Basics

**Pitch**

- **Syllable**: 1, 2, 3, 4, 5, 6, 7, X. X is a rhythm note (it only marks rhythm and has no specific pitch).
- **Octave dots**: -3 to +3, from three octaves lower to three octaves higher; 0 means no dots.
- **Accidental**: None / Sharp ♯ / Flat ♭ / Double sharp 𝄪 / Double flat 𝄫 / Natural ♮. Once set, you can adjust its horizontal offset.

**Rhythm**

- **Duration**: 1 / 1/2 / 1/4 / 1/8 / 1/16 / 1/32 / 1/64 / 1/128. In number notation, half and whole notes are shown with dashes after the digit, and eighth notes and shorter with underlines below the digit.
- **Dot**: None / · / ·· / ···.
- **Beam connection**: Combined / Right only / None. Controls whether the underlines of neighboring notes are joined.

**Add voice note**

To stack a note at the same position (for example, a harmony):

1. Choose the "Syllable" (1–7), "Octave dots", and "Accidental" of the note to stack.
2. Click "Add at same slot".

**Horizontal offset**: a slider from -40 to 40 for fine-tuning the horizontal position of the whole note.

**Grace notes**: "Add grace before" and "Add grace after"; you can delete them one by one in the list below. Click a grace note on the score to select it on its own and edit it.

### Marks

Add single-note marks such as accents, staccato, trills, and dynamics. See [Other symbols](#edit-symbols).

Number notation notes also have two **guzheng** groups:

- **Guzheng fingering**: Tuo, Pi, Mo, Tiao, Gou, Ti, Da, Zhai, Ti (lift), Bo, Small Cuo, Big Cuo. Only one per group.
- **Guzheng techniques**: Sao (sweep) and Yao (tremolo). These can be added together with a fingering.

### Lines

Add spanning marks such as arpeggios, slurs, pedals, 8va / 8vb, trill lines, and crescendos / diminuendos. See [Other symbols](#edit-symbols). Slurs in number notation have no center control point.

Number notation can also add **guzheng continuous fingering**: choose a "Span", then click one of Lian Tuo, Lian Pi, Lian Mo, Lian Tiao, Lian Gou, Lian Ti, Lian Da, Lian Zhai. It is drawn below the staff from the current note to the last note of the span. Click it on the score to change the fingering, adjust the range and both ends, or drag the handles at both ends and in the middle.

## Rest property panel

In number notation a rest is written "0". When selected, two tabs are shown, "Basics" and "Marks". You can change the duration, dot, beam connection, and horizontal offset, and add marks.

## Deleting

- Select the item and press `Delete` or `Backspace`.
- If several notes are stacked at the same position, only the selected one is deleted.
