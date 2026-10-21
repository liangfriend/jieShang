A score is made up of a **title, grand staves, single staves, and measures**. They nest inside each other: a grand staff contains single staves, a single staff contains measures, and measures hold notes and rests.

```
Score
├─ Title area: title, subtitle, author, key / time signature / tempo
├─ Grand staff 1
│   ├─ Single staff 1: measure measure measure …
│   └─ Single staff 2: measure measure measure …
├─ Grand staff 2
│   ├─ Single staff 1: …
│   └─ Single staff 2: …
└─ …
```

- **Grand staff**: one "big row" of the score, arranged from top to bottom.
- **Single staff**: each row of notation inside a grand staff. For example, one grand staff of a piano score contains two single staves, a treble staff and a bass staff, joined by a brace.
- **Measure**: the segments a single staff is divided into by barlines.

> Within one score, try to keep the same number of single staves in every grand staff, for example row 1 is always the right hand and row 2 is always the left hand. Practice mode, Beginner mode, Singing mode, and score-audio sync all require every grand staff to have the same number of single staves.

## Title area

The title area sits at the very top of the score. In Edit mode you can click it and type directly:

- "Title", "Subtitle", and "Author". You can press Enter in the author field to start a new line.
- If the score has a key signature, time signature, or tempo, there is an extra line below the title: "1 =" key signature, time signature, beat unit, and tempo. You can edit these directly too. If you enter an invalid tempo, it reverts to 120.

The title is the name this score shows in "My scores".

## Areas

Grand staves, single staves, and measures all have areas above, below, left, and right of them, used for extra content such as lyrics, fingering charts, and tone names. The figure below shows the areas around one grand staff (containing one single staff and two measures):

![Areas around a grand staff: pink blocks hold content, white blocks are spacing](score-slots.png)

- **Pink blocks**: areas for extra content. The labels in the figure are "whose – which side" abbreviations, only for matching against the table below: `g` grand staff, `s` single staff, `m` measure; `u` above, `d` below, `l` left, `r` right. For example, `g-d` means "below the grand staff".
- **White blocks**: spacing between contents. The grand staff `uSpace` / `dSpace` in the figure are the grand staff's top / bottom margins in "Layout" ("Grand staff margins" → "Top margin" / "Bottom margin"). The four single staff labels (top margin outer, top margin inner, bottom margin inner, bottom margin outer) correspond to "Outer top" / "Inner top" / "Inner bottom" / "Outer bottom" under "Single staff margins".

Commonly used areas:

| Position | Label in figure | What goes there |
| --- | --- | --- |
| Top of the score (title area) | — | Title, subtitle, author, key / time signature / tempo |
| Below each grand staff | `g-d` | The add/remove grand staff buttons in Edit mode (height 0, buttons on the left) |
| Left of each single staff (left margin) | `s-l` | With "Show instrument" on, the tone name of that single staff |
| Right of each single staff (right margin) | `s-r` | The end of a slur that continues onto the next line |
| Below each single staff | `s-d` | **Lyrics** (height 0, drawn down into the single staff's outer bottom margin); the add/remove single staff buttons and the add-measure button in Edit mode |
| Below each measure | `m-d` | **Fingering marks for xiao and dizi** |

You can set the left/right margin widths, the lyrics font and font size, the various margins, and so on in "Layout" under [Top toolbar](#edit-top).

## Lyrics

Every single staff has its own lyrics, written below that single staff. There is an input box under each note position; just click it and type. Lyrics don't take up height of their own; they are drawn inside the single staff's outer bottom margin. If you have many lyrics lines or a large font size, increase the single staff's "Outer bottom" margin in "Layout".

- "+行" adds a lyrics line, for multiple verses; "−行" deletes the last line. At least one line is always kept.
- You can't add lyrics lines while the single staff has no notes yet.
- In a lyrics input box, press `Tab` to jump to the next note's lyric and `Shift+Tab` to go back to the previous one. When the current note starts a slur, `Tab` jumps straight to the note after the end of the slur.
- Lyrics are also shown in Play mode, Practice mode, and other views.

### Match lyrics

The "Match lyrics" button, right of the "Lyrics" switch at the top, opens a draggable window for typing a whole row of lyrics at once:

- There is one input box per grand staff ("Row 1", "Row 2", …). As you type, the syllables fill the first lyrics line of the notes in order.
- Each line in a box (press Enter for a new line) is the next single staff: the first line fills the grand staff's first single staff, the second line the second one, and so on. Lines beyond the number of single staves are reported as not placed.
- Rests are skipped, and so are notes covered by a slur: the note where the slur starts takes the syllable, and the covered notes after it get none (this includes slurs coming from the previous grand staff). For example, in `1 2 3 4` with a slur on 2 and 3, typing "你好吗" fills notes 1, 2, and 4.
- CJK characters get one note each; other text is split into words by spaces, and `-` splits syllables (such as `hel-lo`).
- Use `_` to skip a note; for example, "你_好" puts "你" and "好" on notes 1 and 3.
- If there are fewer syllables than notes, lyrics on the remaining notes are cleared; extra syllables are not placed, and the window tells you which single staff has how many extra.
- When the window opens, the boxes show the existing lyrics so you can keep editing them; `Ctrl+Z` undoes changes.

## Fingering marks for xiao and dizi

Fingering marks are drawn below each measure, showing the matching fingering chart under each note. They are not set in Edit mode. Instead, choose the key of the xiao or dizi under "Marks" in the bottom toolbar of [Play mode](#play-features). Notes outside the instrument's range are not drawn.
