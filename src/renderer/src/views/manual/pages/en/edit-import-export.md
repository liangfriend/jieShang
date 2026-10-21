"Import" and "Export" in the top-right corner of Edit mode let you exchange scores with other software. You can also use them for backups.

## Import

> Importing **overwrites everything in the current score**. After importing, check the result, then click "Save".

| Option | File type | Notes |
| --- | --- | --- |
| Decipher score (.sj) | `.sj` | Decipher's own score format, restored exactly as saved |
| MusicXML | `.xml`, `.musicxml` | A common score exchange format. The compressed `.mxl` format is not supported |
| MIDI | `.mid`, `.midi` | Always becomes **staff notation** after import |
| Image to score (number notation) | PNG, JPG, WebP, BMP images | Recognizes number notation in images |

When an import succeeds, you'll see "Imported" followed by the file name.

### MIDI import rules

- Notes are quantized to sixteenth notes; rhythms that are too fine are snapped to sixteenth notes.
- Each channel of each track becomes one single staff. A piano track with a very wide range is automatically split into two rows at middle C.
- Channel 10 (percussion) is ignored.
- Unsupported time signatures are changed to 4/4. If there are several tempos, only the first is kept.
- Each row holds 4 measures, and notes that cross a barline are joined with ties. When there are several staves, a brace is added automatically.
- If some content couldn't be kept, you'll see "Some MIDI content was not kept" along with the reasons.

### Image to score (number notation)

1. Choose "Image to score (number notation)" to open the image-to-score window. **Only number notation can be recognized.**
2. Click or drag in images. You can add several at once (for example, multiple pages of one song). You can move them up or down, sort them by file name, or remove them; click a thumbnail to view it larger.
3. Click "Generate". The images are recognized one by one with a progress display, and each image shows the number of rows and measures, the key signature, the time signature, and any notices that were recognized. You can stop during recognition.
4. Images that fail recognition are marked in red. You can replace an image and retry, or skip the failed images and generate from the rest.
5. Multiple images are joined into one score in list order. The key and time signature of the whole score are taken from the first ones recognized; if a page's key or time signature changes, it is written on that page's first measure.
6. The result overwrites the current score. You can undo with `Ctrl+Z`.

> Recognition is never perfect. After generating, compare the result with the original images before saving.

## Export

| Option | Notes |
| --- | --- |
| Decipher score (.sj) | Saves the complete score; it can be imported back into Decipher exactly as is. Good for backups and sharing |
| MusicXML(ms4) | MusicXML 4.0, for newer notation software |
| MusicXML(ms3) | MusicXML 3.1, compatible with older software such as MuseScore 3 |
| MIDI | Each single staff is exported as one track |
| Work | Lays the score out in a new work, split into pages automatically; see below |

When you export number notation to MusicXML, it is first converted automatically to staff notation spelled in C, then exported.

### Export as work

1. Choose "Export" → "Work" to open the settings window.
2. Pick a page template (A4, A5, B5, Letter, 16:9 and so on; paper sizes come in portrait and landscape), or type the page width and height.
3. Set the **score width**: the score is scaled to this width.
4. Set the **top margin**: how far below the top of the page the score starts.
5. Click "OK". A new work is created and opened in the work editor:
   - On every page the score is centered horizontally and starts at the top margin.
   - Grand staves that don't fit on a page move whole to the next page, and the same margin is kept at the bottom.
   - The title goes on the first page.

The work doesn't appear in "My Works" until you save it, so check it and then save. Your last settings are remembered.
