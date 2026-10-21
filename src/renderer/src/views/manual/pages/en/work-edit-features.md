## Top toolbar

| Button | Description |
| --- | --- |
| Undo | Undo the last step; shortcut `Ctrl+Z` |
| Redo | Redo an undone action; shortcut `Ctrl+Y` or `Ctrl+Shift+Z` |
| Settings | Open "Work settings" to change the work's name, author and page size |
| Present | Switch to [Presentation mode](#work-show) |
| Save | Save the work |
| Import / Export / Volume | Same as in Presentation mode; see [Presentation mode features](#work-show-features) |

### Undo and redo

- Up to 30 steps are kept. One drag or one input counts as one step.
- When you undo, the view automatically jumps to the page that changed.
- Opening or importing a work clears the undo history.
- While you're typing in an input box, the shortcuts apply to the input box itself.

### Saving

- **New work**: the "Save work" dialog appears. Enter a "Title" (required) and an "Author" (optional), then click "Save".
- **A work that's been saved before**: it's saved directly, with no dialog. To change the name or author, first change it in "Settings"; see "Work settings" below.

There's no autosave and no `Ctrl+S` shortcut.

## Page management

Buttons below the thumbnails on the left:

| Button | Description |
| --- | --- |
| Add page | Add a blank page at the end |
| Insert | Insert a blank page after the current page |
| Delete | Delete the current page (no confirmation; can be undone). You can't delete the last remaining page |
| Copy | Duplicate the current page and place the copy after it |

Right-click a thumbnail for "Copy", "Paste" and "Delete". "Paste" **overwrites** the target page with the copied content. Pages can't be reordered by dragging.

## Work settings

| Item | Description |
| --- | --- |
| Name / Author | After changing them, click "Apply", then "Save" at the top to write them to the work library. The name can't be empty |
| Default page | The size used for pages you create from now on. Click "Save" to set it as the default; "Apply to all" changes every page to this size |
| Current page | Change the width and height of the current page, then click "Apply" |
| Standard | Choose from presets: A3, A4, A5, B4, B5 and Letter in portrait and landscape, plus screen 16:9 (1280×720) and 4:3 (1024×768) |

Sizes are in pixels, ranging from 100 to 10000. The default is 794 × 1123, which matches A4 portrait.

## Tools panel

### Draw

- After clicking "Start drawing", you can draw on the page with the "Pen" or "Eraser". The pen color is black by default, and the stroke size ranges from 1 to 80.
- Strokes drawn here **are saved to the work**, unlike the temporary marks in Presentation mode.
- While drawing, you can't select or drag elements; click "Exit drawing" to get that back.
- "Clear page strokes" clears all strokes on the current page.

### Page background

- "Set background": choose an image from "My images" and click "Use as background". The background is stretched to fill the whole page.
- "Clear background": removes the background.

### Media library

Click "Open library", choose an item under "Images", "Audio" or "Video", and click "Add to page". Media must first be uploaded to [My images / audio / videos](#media).

- Images and videos are added at their original size (480×270 if a video's size can't be read).
- Audio is a small 320×64 player.

### Add text

Fill in "Text", set the "Size" (8–200, default 16) and "Color", then click "Add to page".

After adding it, select the text to change its "Size" and "Color" in the properties panel in the top-right corner. Double-click the text to edit it: `Enter` inserts a line break, `Ctrl+Enter` or clicking elsewhere finishes, and `Esc` cancels.

### Add score

1. Use the search box to find a score from "My scores" and click it to select it.
2. Set the "Scale" (0.1–2, default 0.5) and "Score skin".
3. Click "Add".

The score's bound vocal and accompaniment are carried over automatically. You **can't change the notes** of a score in a work; to change it, edit it in "My scores" and add it again.

## Placing elements

- **Select**: click an element; click an empty area of the page to deselect.
- **Move**: drag the element. For video and audio, drag the **border** around the edge (the middle is reserved for the play button).
- **Resize**: drag the four corners. Resizing is centered on the element's middle, doesn't keep the aspect ratio, and has a minimum of 24 pixels.
- **Rotate**: drag the round handle above the element.
- **Delete**: select it and press `Delete` or `Backspace`, or right-click and choose "Delete". There's no confirmation; it can be undone.

Scores are always shown below other elements. There's no snap grid, no multi-select, and no way to change layer order.

### Right-click menu

| Menu item | Applies to | Description |
| --- | --- | --- |
| Straighten | All | Resets the rotation angle to 0 |
| Center horizontally | All | Moves the element to the horizontal center of the page |
| Restore proportion | Scores, images, videos | Keeps the width and recalculates the height from the original aspect ratio |
| Crop / Finish crop | Scores, images | Enters or exits cropping |
| Delete | All | |

## Properties panel

When a **score, image or text** is selected, the "Properties" panel appears in the top-right corner. Audio and video have no properties panel.

### Position & size

X, Y, Width, Height and Rotation (-360 to 360). "Lock ratio" is checked by default; when you change the width or height in the panel, the other changes proportionally.

### Text style

Text only: "Size" 8–200, and "Color", which you can pick with the color picker. The "Info" and "Crop" sections below are shown only for scores and images.

### Info

- Images: name and original size.
- Scores: vocal, accompaniment and score size.

### Crop

Use this when you only want to show part of a score or image:

- **Drag to crop**: click "Drag to crop" and the frame turns orange. Drag the four corners to set the area to keep; drag outward to restore cropped-off parts. Press `Enter` or `Esc`, or click "Finish crop" to finish.
- **Crop by grand staff** (scores only): under "From" and "To", choose "Title" or "Grand staff n", then click "Crop by grand staff" to keep only those lines. Turn on "Lock top-left" to keep the starting position fixed.
- **Numeric crop**: enter the start X / Y and end X / Y directly.
- **Keep frame size (stretch to fill)**: when checked, cropping doesn't change the element's size; the content is stretched to fill it.
- **Clear crop**: restores the full content.

Cropping ends automatically if you select another element, turn the page, switch to Presentation mode, or start drawing.
