posite false

src/renderer/src/components/pianoMidiBoxCanvas.vue:13:29 - error TS2307: Cannot find module '../../types/enum' or its corresponding type declarations.

13 import { KeyCodeEnum } from '../../types/enum'
~~~~~~~~~~~~~~~~~~

src/renderer/src/components/pianoWaterfallCanvas.vue:13:29 - error TS2307: Cannot find module '../../types/enum' or its corresponding type declarations.

13 import { KeyCodeEnum } from '../../types/enum'
~~~~~~~~~~~~~~~~~~

src/renderer/src/components/pianoWaterfallCanvas.vue:15:50 - error TS2307: Cannot find module '@/types/types' or its corresponding type declarations.

15 import { HighlightPolicy, NoteScoreResult } from '@/types/types'
~~~~~~~~~~~~~~~

src/renderer/src/components/virtualPiano.vue:18:8 - error TS2307: Cannot find module 'deciphony-core' or its corresponding type declarations.

18 } from 'deciphony-core'
~~~~~~~~~~~~~~~~

src/renderer/src/components/virtualPiano.vue:397:18 - error TS2345: Argument of type '{ whiteKeyCount: number; groupName: string; color: any; }' is not assignable to parameter of type 'never'.

397         res.push(cur)
~~~

src/renderer/src/components/virtualPiano.vue:400:18 - error TS2345: Argument of type '{ whiteKeyCount: number; groupName: string; color: any; }' is not assignable to parameter of type 'never'.

400         res.push(cur)
~~~

src/renderer/src/components/virtualPiano.vue:530:74 - error TS2345: Argument of type 'null' is not assignable to parameter of type 'Element'.

530   const { value: left, unit } = parseAndFormatDimension(getComputedStyle(chordBoxRef.value).left)
~~~~~~~~~~~~~~~~~

src/renderer/src/components/virtualPiano.vue:537:5 - error TS2532: Object is possibly 'undefined'.

537     {
~
538       '0': 0,
~~~~~~~~~~~~~
...
549       '11': 6
~~~~~~~~~~~~~
550     }['' + solmizationIndex] * whiteKeyWidthNum.value
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/components/virtualPiano.vue:619:17 - error TS2532: Object is possibly 'undefined'.

619   let midiAdd = relativeMidiAdd.find((e) => {
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
620     const relativeLeft = (left + passWidth) % (7 * whiteKeyWidthNum.value)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
623     }
~~~~~
624   }).relativeMidi
~~~~

src/renderer/src/dr-extensions/dr-edit/score-builder/factories.ts:69:34 - error TS2352: Conversion of type 'AccidentalTypeEnum' to type '1 | 2 | 3' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.

69     return createAugmentationDot(input as 1 | 2 | 3);
~~~~~~~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-edit/score-builder/factories.ts:75:5 - error TS2741: Property 'description' is missing in type '{ id: string; type: MusicScoreTypeEnum; title: string; bpm: number; topSpaceHeight: number; width: number; height: number; grandStaffs: never[]; affiliatedSymbols: never[]; }' but required in type 'MusicScore'.

75     return {
~~~~~~

node_modules/deciphony-renderer/dist/types/MusicScoreType.d.ts:14:5
14     description: string;
~~~~~~~~~~~
'description' is declared here.

src/renderer/src/dr-extensions/dr-edit/score-builder/factories.ts:372:74 - error TS2322: Type 'AccidentalTypeEnum | undefined' is not assignable to type 'Accidental | undefined'.
Type 'import("D:/data/jieShang/node_modules/deciphony-renderer/dist/enums/musicScoreEnum").AccidentalTypeEnum' is not assignable to type 'Accidental'.
Type 'import("D:/data/jieShang/node_modules/deciphony-renderer/dist/enums/musicScoreEnum").AccidentalTypeEnum' is not assignable to type '{ id: string; type: AccidentalTypeEnum; widthRatio?: number | undefined; widthRatioForMeasure?: number | undefined; }'.

372             createNotesNumberInfo(ni.syllable, {octaveDot: ni.octaveDot, accidental: ni.accidental}),
~~~~~~~~~~

src/renderer/src/dr-extensions/dr-edit/score-builder/factories.ts:378:17 - error TS2322: Type 'AccidentalTypeEnum | undefined' is not assignable to type 'Accidental | undefined'.
Type 'import("D:/data/jieShang/node_modules/deciphony-renderer/dist/enums/musicScoreEnum").AccidentalTypeEnum' is not assignable to type 'Accidental'.
Type 'import("D:/data/jieShang/node_modules/deciphony-renderer/dist/enums/musicScoreEnum").AccidentalTypeEnum' is not assignable to type '{ id: string; type: AccidentalTypeEnum; widthRatio?: number | undefined; widthRatioForMeasure?: number | undefined; }'.

378                 accidental: options.accidental,
~~~~~~~~~~

src/renderer/src/dr-extensions/dr-musicxml-transfer/musicxml-util.ts:438:29 - error TS2345: Argument of type 'GrandStaff' is not assignable to parameter of type 'never'.

438       splitGrandStaffs.push(newGrandStaff)
~~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-musicxml-transfer/musicxml-util.ts:500:9 - error TS2554: Expected 2 arguments, but got 1.

500         attributesSwitch(attributesData);
~~~~~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-musicxml-transfer/musicxml-util.ts:590:43
590 function attributesSwitch(attributesData, musicScoreEditor) {
~~~~~~~~~~~~~~~~
An argument for 'musicScoreEditor' was not provided.

src/renderer/src/dr-extensions/dr-numberNotation-transfer/transfer.ts:142:79 - error TS2554: Expected 1-2 arguments, but got 3.

142   const {octave, syllable, accidental} = getOctaveAndSyllable(midi, priority, state.curKeySignature)
~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-numberNotation-transfer/transfer.ts:223:40 - error TS2554: Expected 1 arguments, but got 2.

223   const midi = getNoteNumberMidi(info, keySignature)
~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-play/numberNotation/playSequence.ts:39:37 - error TS2554: Expected 1 arguments, but got 2.

39   const midi = getNoteNumberMidi(g, keySignature)
~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-play/numberNotation/playSequence.ts:99:40 - error TS2554: Expected 1 arguments, but got 2.

99     const midi = getNoteNumberMidi(ni, keySignature)
~~~~~~~~~~~~

src/renderer/src/store/play.store.ts:6:19 - error TS2307: Cannot find module '@renderer/toneColor/accoustic_grand_piano' or its corresponding type declarations.

6 import piano from '@renderer/toneColor/accoustic_grand_piano'
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/store/play.store.ts:195:36 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

195       const res = await window.api.collection.get(id)
~~~~~~~~~~

src/renderer/src/store/play.store.ts:239:13 - error TS2339: Property 'trigger' does not exist on type 'NPlayer'.

239     nplayer.trigger({
~~~~~~~

src/renderer/src/store/play.store.ts:255:13 - error TS2339: Property 'release' does not exist on type 'NPlayer'.

255     nplayer.release({ id })
~~~~~~~

src/renderer/src/store/play.store.ts:260:14 - error TS2339: Property 'releaseAll' does not exist on type 'NPlayer'.

260     nplayer?.releaseAll()
~~~~~~~~~~

src/renderer/src/template/empty.ts:15:3 - error TS2724: '"../dr-extensions/dr-edit/score-builder"' has no exported member named 'createEmptyMeasure'. Did you mean 'createMeasure'?

15   createEmptyMeasure,
~~~~~~~~~~~~~~~~~~

src/renderer/src/dr-extensions/dr-edit/score-builder/factories.ts:121:17
121 export function createMeasure(options: CreateMeasureOptions = {}): Measure {
~~~~~~~~~~~~~
'createMeasure' is declared here.

src/renderer/src/utils/achievementHelper.ts:25:32 - error TS2339: Property 'achievement' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

25   const res = await window.api.achievement.list()
~~~~~~~~~~~

src/renderer/src/utils/achievementHelper.ts:65:20 - error TS2339: Property 'achievement' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

65   await window.api.achievement.unlock({ key })
~~~~~~~~~~~

src/renderer/src/utils/achievementHelper.ts:70:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

70   const res = await window.api.collection.update(collectionId, { owned: true })
~~~~~~~~~~

src/renderer/src/utils/collection/collectionHelper.ts:28:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

28   const res = await window.api.collection.query({ owned: true })
~~~~~~~~~~

src/renderer/src/utils/collection/collectionHelper.ts:69:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

69   const res = await window.api.collection.delete(id)
~~~~~~~~~~

src/renderer/src/utils/collection/initCollectionSelection.ts:16:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

16   const res = await window.api.collection.get(id)
~~~~~~~~~~

src/renderer/src/utils/collection/performSkinLoader.ts:11:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

11   const res = await window.api.collection.get(skinId)
~~~~~~~~~~

src/renderer/src/utils/collection/scoreSkinLoader.ts:22:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

22   const res = await window.api.collection.get(skinId)
~~~~~~~~~~

src/renderer/src/utils/collection/toneColorUsage.ts:28:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

28   const res = await window.api.collection.query({ type: 'tone_color', owned: true })
~~~~~~~~~~

src/renderer/src/utils/collection/virtualPianoSkinLoader.ts:21:32 - error TS2339: Property 'collection' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

21   const res = await window.api.collection.get(skinId)
~~~~~~~~~~

src/renderer/src/utils/noteSliceHighScoreHelper.ts:47:32 - error TS2339: Property 'noteSliceHighScore' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

47   const res = await window.api.noteSliceHighScore.list()
~~~~~~~~~~~~~~~~~~

src/renderer/src/utils/noteSliceHighScoreHelper.ts:77:20 - error TS2339: Property 'noteSliceHighScore' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

77   await window.api.noteSliceHighScore.upsertIfHigher(mode, difficulty, score)
~~~~~~~~~~~~~~~~~~

src/renderer/src/utils/noteSliceHighScoreHelper.ts:82:20 - error TS2339: Property 'noteSliceHighScore' does not exist on type '{ file: { upload(buffer: ArrayBuffer, originalName: string, type: "audio" | "video" | "image", displayName: string): Promise<{ name: string; type: string; url: string; }>; ... 4 more ...; exportMusicXml(content: string, defaultName?: string | undefined): Promise<...>; }; score: { ...; }; work: { ...; }; group: { ......'.

82   await window.api.noteSliceHighScore.upsertIfHigher('extreme', 'standard', survivalMs)
~~~~~~~~~~~~~~~~~~

src/renderer/src/utils/scoreRoute.ts:144:5 - error TS2322: Type 'MusicScore | undefined' is not assignable to type 'MusicScore | null'.
Type 'undefined' is not assignable to type 'MusicScore | null'.

144     return dataStore.getTempScore(EDIT_NEW_SCORE_TEMP_ID)
~~~~~~

src/renderer/src/utils/staffNotes.ts:6:22 - error TS2339: Property 'graceNotes' does not exist on type 'NotesInfo'.

6   for (const g of ni.graceNotes ?? []) collectNotesInfoIds(g, onId)
~~~~~~~~~~

src/renderer/src/utils/staffNotes.ts:7:22 - error TS2339: Property 'graceNotesAfter' does not exist on type 'NotesInfo'.

7   for (const g of ni.graceNotesAfter ?? []) collectNotesInfoIds(g, onId)
~~~~~~~~~~~~~~~

src/renderer/src/utils/staffNotes.ts:14:60 - error TS2345: Argument of type 'NotesNumberInfo' is not assignable to parameter of type 'NotesInfo'.
Type 'NotesNumberInfo' is missing the following properties from type '{ id: string; direction: "up" | "down"; region: number; chronaxie: Chronaxie; beamType: BeamTypeEnum; augmentationDot?: AugmentationDot | undefined; affiliatedSymbols: SingleNoteAffiliatedSymbol[]; accidental?: Accidental | undefined; }': direction, region, chronaxie, beamType, affiliatedSymbols

14       for (const ni of note.notesInfo) collectNotesInfoIds(ni, onId)
~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:101:36 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

101     voltaText.value = volta?.data?.volta?.text ?? ''
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:102:41 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

102     voltaValueText.value = volta?.data?.volta ? formatVoltaValue(volta.data.volta.value) : ''
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:102:77 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

102     voltaValueText.value = volta?.data?.volta ? formatVoltaValue(volta.data.volta.value) : ''
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:118:21 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

118   if (!volta?.data?.volta) return
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:119:32 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

119   voltaText.value = volta.data.volta.text
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:120:54 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

120   voltaValueText.value = formatVoltaValue(volta.data.volta.value)
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:133:20 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

133   if (!volta?.data.volta) return
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:134:14 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

134   volta.data.volta.text = voltaText.value
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:139:20 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

139   if (!volta?.data.volta) return
~~~~~

src/renderer/src/views/editor/editHelper/components/MeasurePropertyPanel.vue:140:14 - error TS2339: Property 'volta' does not exist on type '{ volta?: { text: string; value: number[]; relativeX?: number | undefined; relativeY?: number | undefined; relativeW?: number | undefined; relativeH?: number | undefined; heightRatio?: number | undefined; openLeft?: boolean | undefined; openRight?: boolean | undefined; } | undefined; } | { ...; }'.
Property 'volta' does not exist on type '{ slur?: { relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; } | undefined; }'.

140   volta.data.volta.value = parseVoltaValueText(voltaValueText.value)
~~~~~

src/renderer/src/views/editor/editHelper/components/PropertyPanel.vue:70:69 - error TS2322: Type 'SlotData' is not assignable to type 'VoltaEditSlot'.
Type 'SlotData' is not assignable to type '{ musicScore: MusicScore; self: DoubleMeasureAffiliatedSymbol; }'.
Types of property 'self' are incompatible.
Type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' is not assignable to type 'DoubleMeasureAffiliatedSymbol'.
Type 'GrandStaff' is not assignable to type 'DoubleMeasureAffiliatedSymbol'.
Type 'GrandStaff' is missing the following properties from type '{ id: string; name: DoubleMeasureAffiliatedSymbolNameEnum; startId: string; endId: string; data: { volta?: { text: string; value: number[]; relativeX?: number | undefined; ... 5 more ...; openRight?: boolean | undefined; } | undefined; }; }': name, startId, endId, data

70       <VoltaPropertyPanel v-else-if="kind === 'volta' && selected" :edit-slot="selected" />
~~~~~~~~~

src/renderer/src/views/editor/editHelper/components/VoltaPropertyPanel.vue:15:3
15   editSlot: VoltaEditSlot
~~~~~~~~
The expected type comes from property 'editSlot' which is declared here on type '{ readonly editSlot: VoltaEditSlot; } & VNodeProps & AllowedComponentProps & ComponentCustomProps & Record<...>'

src/renderer/src/views/editor/editHelper/index.ts:146:14 - error TS2304: Cannot find name 'StaffGhostNotePreview'.

146 export type {StaffGhostNotePreview as GhostNotePreviewState}
~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/views/editor/editHelper/index.ts:147:14 - error TS2304: Cannot find name 'NumberGhostPreview'.

147 export type {NumberGhostPreview as GhostNumberPreviewState}
~~~~~~~~~~~~~~~~~~

src/renderer/src/views/editor/editHelper/numberNotation/renderEditSlurAdd.ts:113:26 - error TS2739: Type '{ thickness: number; }' is missing the following properties from type '{ relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; }': relativeStartPoint, relativeEndPoint, relativeControlPoint

113       partial: { data: { slur: { thickness } } }
~~~~

src/renderer/src/views/editor/editHelper/renderEditDelete.ts:38:68 - error TS2345: Argument of type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' is not assignable to parameter of type 'StaffSlot | NoteNumber'.
Type 'GrandStaff' is not assignable to type 'StaffSlot | NoteNumber'.
Type 'GrandStaff' is not assignable to type 'NoteNumber'.
Type 'GrandStaff' is missing the following properties from type '{ id: string; chronaxie: Chronaxie; notesInfo: NotesNumberInfo[]; augmentationDot?: AugmentationDot | undefined; affiliatedSymbols: SingleNoteAffiliatedSymbol[]; beamType: BeamTypeEnum; widthRatio?: number | undefined; widthRatioForMeasure?: number | undefined; }': chronaxie, notesInfo, affiliatedSymbols, beamType

38     return selected?.measure != null && self != null && isNoteRest(self)
~~~~

src/renderer/src/views/editor/editHelper/renderEditDelete.ts:46:29 - error TS2345: Argument of type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' is not assignable to parameter of type 'StaffSlot | NoteNumber'.
Type 'GrandStaff' is not assignable to type 'StaffSlot | NoteNumber'.
Type 'GrandStaff' is not assignable to type 'NoteNumber'.
Type 'GrandStaff' is missing the following properties from type '{ id: string; chronaxie: Chronaxie; notesInfo: NotesNumberInfo[]; augmentationDot?: AugmentationDot | undefined; affiliatedSymbols: SingleNoteAffiliatedSymbol[]; beamType: BeamTypeEnum; widthRatio?: number | undefined; widthRatioForMeasure?: number | undefined; }': chronaxie, notesInfo, affiliatedSymbols, beamType

46     return isNoteNumberSlot(self) && isSlotRestLike(self)
~~~~

src/renderer/src/views/editor/editHelper/renderEditSelection.ts:113:53 - error TS2352: Conversion of type 'DoubleNoteAffiliatedSymbol | DoubleMeasureAffiliatedSymbol' to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type 'DoubleMeasureAffiliatedSymbol' is not comparable to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore'.
Type 'DoubleMeasureAffiliatedSymbol' is not comparable to type 'NotesInfo'.
Type 'DoubleMeasureAffiliatedSymbol' is missing the following properties from type '{ id: string; direction: "up" | "down"; region: number; chronaxie: Chronaxie; beamType: BeamTypeEnum; augmentationDot?: AugmentationDot | undefined; affiliatedSymbols: SingleNoteAffiliatedSymbol[]; accidental?: Accidental | undefined; }': direction, region, chronaxie, beamType, affiliatedSymbols

113             return buildSlotData(musicScore, {self: sym as SlotData['self']})
~~~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/views/editor/editHelper/renderEditSelection.ts:120:53 - error TS2352: Conversion of type 'DoubleNoteAffiliatedSymbol | DoubleMeasureAffiliatedSymbol' to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type 'DoubleMeasureAffiliatedSymbol' is not comparable to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore'.
Type 'DoubleMeasureAffiliatedSymbol' is not comparable to type 'NotesInfo'.
Type 'DoubleMeasureAffiliatedSymbol' is missing the following properties from type '{ id: string; direction: "up" | "down"; region: number; chronaxie: Chronaxie; beamType: BeamTypeEnum; augmentationDot?: AugmentationDot | undefined; affiliatedSymbols: SingleNoteAffiliatedSymbol[]; accidental?: Accidental | undefined; }': direction, region, chronaxie, beamType, affiliatedSymbols

120             return buildSlotData(musicScore, {self: sym as SlotData['self']})
~~~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/views/editor/editHelper/renderEditSelection.ts:179:19 - error TS2352: Conversion of type 'Clef | Barline | TimeSignature | KeySignature | MeasureStartRepeat | MeasureEndRepeat' to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type 'MeasureEndRepeat' is not comparable to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore'.
Type 'MeasureEndRepeat' is not comparable to type 'NoteSymbol'.
Property 'notesInfo' is missing in type 'MeasureEndRepeat' but required in type '{ id: string; type: NoteSymbolTypeEnum.Note; notesInfo: NotesInfo[]; graceNotes?: NotesInfo[] | undefined; graceNotesAfter?: NotesInfo[] | undefined; clef?: Clef | undefined; widthRatio?: number | undefined; widthRatioForMeasure?: number | undefined; }'.

179             self: measureSymbol.symbol as SlotData['self'],
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/deciphony-renderer/dist/types/MusicScoreType.d.ts:164:5
164     notesInfo: NotesInfo[];
~~~~~~~~~
'notesInfo' is declared here.

src/renderer/src/views/editor/editHelper/renderEditSelection.ts:205:27 - error TS2352: Conversion of type 'Bracket' to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type 'Bracket' is not comparable to type 'NoteSymbol'.
Property 'notesInfo' is missing in type 'Bracket' but required in type '{ id: string; type: NoteSymbolTypeEnum.Note; notesInfo: NotesInfo[]; graceNotes?: NotesInfo[] | undefined; graceNotesAfter?: NotesInfo[] | undefined; clef?: Clef | undefined; widthRatio?: number | undefined; widthRatioForMeasure?: number | undefined; }'.

205                     self: grandStaff.bracket as SlotData['self'],
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/deciphony-renderer/dist/types/MusicScoreType.d.ts:164:5
164     notesInfo: NotesInfo[];
~~~~~~~~~
'notesInfo' is declared here.

src/renderer/src/views/editor/editHelper/renderEditSelection.ts:225:49 - error TS2352: Conversion of type 'DoubleNoteAffiliatedSymbol | DoubleMeasureAffiliatedSymbol' to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type 'DoubleMeasureAffiliatedSymbol' is not comparable to type 'GrandStaff | SingleStaff | Measure | NoteSymbol | NoteNumber | NotesInfo | NotesNumberInfo | MusicScore'.
Type 'DoubleMeasureAffiliatedSymbol' is not comparable to type 'NotesInfo'.
Type 'DoubleMeasureAffiliatedSymbol' is missing the following properties from type '{ id: string; direction: "up" | "down"; region: number; chronaxie: Chronaxie; beamType: BeamTypeEnum; augmentationDot?: AugmentationDot | undefined; affiliatedSymbols: SingleNoteAffiliatedSymbol[]; accidental?: Accidental | undefined; }': direction, region, chronaxie, beamType, affiliatedSymbols

225         return buildSlotData(musicScore, {self: affiliated as SlotData['self']})
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/views/editor/editHelper/standardStaff/renderEditNoteHeadDrag.ts:17:12 - error TS18047: 'selected' is possibly 'null'.

17         && selected.self === info
~~~~~~~~

src/renderer/src/views/editor/editHelper/standardStaff/renderEditNoteHeadDrag.ts:18:12 - error TS18047: 'selected' is possibly 'null'.

18         && selected.note != null
~~~~~~~~

src/renderer/src/views/editor/editHelper/standardStaff/renderEditNoteHeadDrag.ts:19:12 - error TS18047: 'selected' is possibly 'null'.

19         && selected.measure != null
~~~~~~~~

src/renderer/src/views/editor/editHelper/standardStaff/renderEditSlurAdd.ts:5:39 - error TS2307: Cannot find module '../renderEditNoteHeadProperties' or its corresponding type declarations.

5 import type { NoteHeadEditSlot } from '../renderEditNoteHeadProperties'
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/renderer/src/views/editor/editHelper/standardStaff/renderEditSlurAdd.ts:106:26 - error TS2739: Type '{ thickness: number; }' is missing the following properties from type '{ relativeStartPoint: { x: number; y: number; }; relativeEndPoint: { x: number; y: number; }; relativeControlPoint: { x: number; y: number; }; thickness: number; }': relativeStartPoint, relativeEndPoint, relativeControlPoint

106       partial: { data: { slur: { thickness } } }
~~~~

src/renderer/src/views/editor/EditorScoreWorkspace.vue:96:31 - error TS2322: Type '{ kind: AddNumberSlotKind; chronaxie: Chronaxie; syllable: 1 | 2 | 3 | 4 | 5 | 6 | 7 | "X"; } | { kind: AddNoteSlotKind; chronaxie: Chronaxie; }' is not assignable to type 'AddNoteState'.
Type '{ kind: AddNumberSlotKind; chronaxie: Chronaxie; syllable: 1 | 2 | 3 | 4 | 5 | 6 | 7 | "X"; }' is not assignable to type 'AddNoteState'.
Types of property 'kind' are incompatible.
Type 'AddNumberSlotKind' is not assignable to type 'AddNoteSlotKind'.
Type '"rhythm"' is not assignable to type 'AddNoteSlotKind'.

96     <AddNoteStatePanel v-else v-model="addNoteState" class="editor-top-bar__note" />
~~~~~~~


src/renderer/src/views/teachingWhiteboard/noteInput.ts:131:89 - error TS2345: Argument of type 'AccidentalTypeEnum | null' is not assignable to parameter of type 'AlteredAccidental | null'.
Type 'AccidentalTypeEnum.Natural' is not assignable to type 'AlteredAccidental | null'.

131   const writeAccidental = resolveAccidentalToWrite(measure, clef, keySignature, region, accidental)
~~~~~~~~~~

