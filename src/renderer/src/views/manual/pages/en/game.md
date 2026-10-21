The main game is inspired by "Fruit Ninja": **note blocks**, each showing a single note, keep popping up on the screen. Play that note on your MIDI keyboard before the block disappears to slice it.

> The main game **only accepts MIDI keyboard** input; you can't play it with the computer keyboard or the mouse. Before you start, make sure the MIDI icon in the bottom-right corner of the home page is green.

## Starting a game

On the home page, click the "Arcade mode", "Endless mode", or "Extreme mode" card to start right away — there's no separate difficulty selection. Choose the difficulty and notation type beforehand in the home page [Settings](#jieshang):

- **Arcade / Endless difficulty**: Easy / Standard / Hard. Only affects Arcade and Endless modes.
- **Game notation**: staff or number notation. Applies to all three modes.

## Common rules

- **Opening countdown**: "3", "2", "1", "Go!" are shown in turn, 4 seconds in total. Key presses are ignored during the countdown.
- **Playing field**: the screen is divided into 5 columns × 3 rows, 15 cells in total. Note blocks appear at random in empty cells and **stay in place**: each one remains for a while, then gradually fades out and disappears. When all 15 cells are full, no new blocks appear.
- **Slicing**: when you play a note, **all** blocks on the field showing that note are cleared.
- **Appearance cue**: when a normal block (or a freeze, double, or heal block) appears, its pitch is played once. The volume is controlled by "Note block sound" in Settings. Bombs make no sound when they appear. So if you have perfect pitch, you can play without reading the notation.
- **No pausing**: you can't pause during a game. Clicking "Back" in the top-left corner exits immediately; quitting midway records no result and does not check achievements.

## What note blocks look like

| Notation | Note block content |
| --- | --- |
| Staff | Clef + key signature + one quarter note. The note may carry a sharp, flat, natural, double sharp, or double flat |
| Number notation | A "1=X" key signature + one number note, which may have octave dots above or below and a sharp or flat |

For staff blocks, work out the pitch from both the clef and the key signature. For example, in G major a note written on the F position is actually F♯, unless it is preceded by a natural sign.

Note blocks use the score skin that is currently "In use". You can switch skins in [Collection](#collection).

## Special note blocks

Special blocks have a colored glow around them. They also show a note, and you slice them by playing that note.

| Name | Glow color | When sliced | Appears in |
| --- | --- | --- | --- |
| Bomb | Red | **Don't slice it!** −10 points in Arcade, −1 life in Endless | Arcade, Endless |
| Freeze | Ice blue | "Slow" for 7 seconds: the stay and fade-out times of all blocks are doubled | Arcade, Endless |
| Double | Gold | "Double" for 7 seconds: points ×2 | Arcade, Endless |
| Heal | Green | Restores 1 life, up to 3 | Extreme |

If you slice another freeze or double block while the effect is active, its 7-second timer restarts; the effects do not stack.

## Wrong-key penalty

Playing a note that is **not** on the field counts as a wrong key:

- **Arcade, Endless**: your combo resets to zero, and a **penalty bomb** with that note is spawned in an empty cell.
- **Extreme**: you lose 1 life immediately.

## Top info bar

- **Left**: the "Back" button and mode info. Arcade shows the time remaining; Endless shows the lives remaining; Extreme shows the lives remaining and the time survived.
- **Center**: the current score. Extreme mode has no score, so it isn't shown.
- **Right**: active boosts, "❄ Slow" and "×2 Double", plus your combo count (shown only at 3 combo or more).

## Results

When a round ends, a results window shows your result for the round and your all-time best. If you beat your best, a "New PR" badge appears; achievements unlocked this round are listed under "Achievements this round". You can choose "Play again" or "Back to home".

## High score records

High scores are recorded separately for each "mode × difficulty × notation (staff / number notation)" combination. Extreme mode has no difficulty levels and is only split into staff and number notation. You can view all high scores on the [Achievements](#achievements) page.
