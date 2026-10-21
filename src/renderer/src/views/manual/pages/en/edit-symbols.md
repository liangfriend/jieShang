Besides notes and rests, you can add many kinds of marks to a score. They fall into three categories: marks attached to a **single note**, marks that span **multiple notes**, and repeat marks attached to a **measure**.

## Single-note marks

Select a note (or rest), then switch to the "Marks" tab in the property panel on the right (the number on the tab shows how many marks it already has). Click an icon to add a mark; click it again to remove it.

| Group | Marks | Notes |
| --- | --- | --- |
| Articulations | Accent, Staccato, Staccatissimo, Tenuto, Louré, Marcato, Accent + staccato, Marcato + staccato, Marcato + tenuto, Staccatissimo (stroke), Staccatissimo (wedge), Stress, Tenuto + accent, Unstress | You can add several at once |
| Techniques / bowing | Open, Muted, Harmonic, Up bow, Down bow, Breath mark | You can add several at once |
| Ornaments | Turn, Inverted turn, Trill, Short trill, Mordent | Only one per group |
| Dynamics | ppp, pp, p, mp, mf, f, ff, fff, fp, pf, sf, sfz, sffz, sfp, rfz, rf, fz | Only one per group |
| Guzheng fingering (number notation only) | Tuo, Pi, Mo, Tiao, Gou, Ti, Da, Zhai, Ti (lift), Bo, Small Cuo, Big Cuo | Only one per group |
| Guzheng techniques (number notation only) | Sao (sweep), Yao (tremolo) | Can be added together with a fingering |

How the icons look depends on the score skin you are using.

### Adjusting and deleting marks

Click a mark on the score to select it. A dashed box appears around it, with a green move button on the right; drag the button to fine-tune the position. The property panel shows "Mark properties":

- **X / Y**: enter an exact position offset.
- **Reset position**: restore the default position.
- **Delete**: delete this mark. You can also just press `Delete`.
- **Replace with**: switch to another mark in the same group, keeping the position offset.

> Some marks are hard to click on the score. You can remove them by clicking the icon again in the note's "Marks" tab.

## Spanning marks

Select a note, then switch to the "Lines" tab in the property panel.

### Column symbols

- "Add arpeggio", "Add prelude bracket (", "Add prelude bracket )".
- An arpeggio applies only to the column of the current note, at most one per column. Once a symbol has been added, its button is no longer shown.

### Add spanning marks

1. First choose a "Span": cover 1 / 2 / 3 / 4 notes to the right, starting from the current note.
2. Then click the mark to add: slur, pedal, 8va, 8vb, trill line, crescendo, diminuendo. Number notation also has guzheng continuous fingering: Lian Tuo, Lian Pi, Lian Mo, Lian Tiao, Lian Gou, Lian Ti, Lian Da, Lian Zhai.
3. A slur must span at least 2 notes. If the column where it ends has several notes (a chord), you can choose which note it connects to.

The following notes are only searched for in the current measure and the next measure; you will see a message if there are not enough notes.

### Starting here

The bottom of the "Lines" tab lists all spanning marks that start at this note. You can delete them directly, and for slurs you can also adjust the line width (2–12). If there are none, "None" is shown.

## After selecting a spanning mark

Click these marks on the score to select them (you need to click precisely on the symbol itself). The property panel shows the corresponding properties:

| Mark | What you can adjust |
| --- | --- |
| Slur | Line width; coverage (Expand left, Expand right, Shrink left, Shrink right, Reset alignment); start and end notes in a chord; start / end position; center control point (not in number notation). You can drag the handles on the score to change the shape. "Apply current position to" applies the current shape to all other slurs in the measure / single staff / grand staff / whole score |
| Ottava | Octave up / octave down |
| Trill line | Start symbol: tr / Upprall / Downprall / Prallprall; drag the handles at both ends and in the middle |
| Crescendo / diminuendo | Style (hairpin, or a cresc. / dim. text line); for hairpins you can adjust the opening; drag the handles at both ends and in the middle |
| Guzheng continuous fingering | Fingering (Lian Tuo / Lian Pi / Lian Mo …), range, end positions; drag the handles at both ends and in the middle |
| Pedal | No dedicated properties |
| Arpeggio | Style (wavy / straight), arrow, reset position |
| Bracket | Bracket type; can be applied to all grand staves |

Once selected, press `Delete` to delete it.

## Voltas

You add a volta in the "Repeats" group of the [Measures](#edit-measure) property panel. Click a volta on the score to select it; the property panel shows "Volta properties":

- **Text**: the text shown on the volta, e.g. "1.".
- **Repeat values**: which playback pass goes through this volta (starting at 1). You can "Add" several, and at least one must remain.
- **Coverage**: Expand left, Expand right, Shrink left, Shrink right, Reset alignment.
- **Ends**: Close left, Close right.
- You can drag it on the score to adjust it; while it is selected, the measures it covers are outlined in green. Press `Delete` to delete it.

## Repeat marks on measures

Repeat marks such as Segno, Coda, Fine, D.C., D.S., and To Coda are set in the "Repeats" group of the [Measures](#edit-measure) property panel.

## Custom symbols

When the built-in marks are not enough, you can upload your own SVG as a symbol. There are **note symbols** (attached to notes or rests) and **measure symbols** (attached to measures). There is no separate list page; everything is managed inside the score editor.

- **Create**: select a note or measure, click `+` in the "Custom symbols" group of the property panel, upload an SVG, then set the name, size, and position and save. The symbol goes into the app's symbol library and can be used in every score.
- **Add to the score**: click a symbol icon in the group to add it to the current note or measure; click it again to remove it.
- **Position**: note symbols are placed from the note head center; a negative vertical offset is above and a positive one below. For numbered notation you can also choose which side of the number to anchor to. Measure symbols can sit above or below the measure, at its start, center, or end. **Offset 1 = one measure height** (~45 px).
- **Manage**: click "Manage" at the top right of the group to edit or delete library symbols; "Export config" / "Import config" backs up or restores the symbol library as JSON.

> When a symbol is added to a score, a copy is saved inside the score. Deleting a symbol from the library, or editing it while another score is open, does not change scores that already use it. After editing a symbol, the same symbol in the currently open score is updated.

## Grace notes

Grace notes are added in the "Basics" tab of the note property panel. See the "Notes" page for each score type, for example [Notes](#edit-staff-note) for staff notation.
