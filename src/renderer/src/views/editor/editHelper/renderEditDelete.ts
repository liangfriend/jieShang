import {
    getMeasureNoteList,
    getMeasureSlots,
    isMeasureNoteVoices,
    isNoteRest,
    isNoteSymbol,
    slotSymbol,
} from '@deciphony/renderer'
import type {
    GrandStaff,
    Measure,
    MeasureNoteSlot,
    MusicScore,
    NoteNumber,
    NoteRest,
    NotesInfo,
    NotesNumberInfo,
    NoteSymbol,
    SlotData,
    TabNote,
    TabNoteInfo,
} from '@deciphony/renderer'
import {
    deleteSingleStaff,
    isDrumNotesInfo,
    isDrumRestBody,
    removeDrumNotesInfo,
    removeDrumRest,
    setTabNoteInfoBend,
} from '@deciphony/extensions/dr-edit'
import {isSlotRestLike} from '@deciphony/extensions/dr-edit/score-builder'
import {asStaffOrNumber, findMeasureNoteIndex, isHostNoteNumberSlot} from './asStaffOrNumber'
import {isGraceNoteSelected, removeGraceById} from './renderEditGraceNotes'
import {isNumberHeadSelected} from './numberNotation/renderEditNumberHeadDrag'
import {removeVolta} from './renderEditMeasureProperties'
import {deleteMeasureColumn} from './renderEditMeasureColumn'
import {isMeasureAddMode} from './standardStaff/renderEditSymbolAddAction'
import {isNoteHeadSelected} from './standardStaff/renderEditNoteHeadDrag'
import {isSlurSelected} from './renderEditSlurDrag'
import {isArpeggioSelected} from './renderEditArpeggioDrag'
import {removeSlotAffiliatedSymbol} from './renderEditSlotAffiliated'
import {isStrummingSelected} from './renderEditStrummingDrag'
import {isPreludeBracketSelected} from './renderEditPreludeBracket'
import {isPedalSelected} from './renderEditPedalDrag'
import {isPitchSelected} from './renderEditPitchDrag'
import {isLineSelected} from './renderEditLineDrag'
import {isNoteAffiliatedSelected, locateNoteAffiliatedById} from './renderEditNoteAffiliatedDrag'
import {removeNoteMark} from './renderEditNoteMarks'
import {isMeasureAffiliatedSelected, removeMeasureAffiliated} from './renderEditMeasureAffiliatedDrag'
import {isVoltaSelected} from './renderEditVoltaDrag'
import {isBracketSelected, removeBracket} from './renderEditBracketProperties'
import {isBendSelected, isTabInfoSelected} from './tab/renderEditTabSelection'
import type {DrumNote, MeasureNoteSymbol} from '@deciphony/renderer'

/** 小节上可选符号（对象字段，delete 移除） */
const MEASURE_OPTIONAL_SYMBOL_KEYS = [
    'barline_f',
    'barline_b',
    'clef_f',
    'clef_b',
    'keySignature_f',
    'keySignature_b',
    'timeSignature_f',
    'timeSignature_b',
    'startRepeat',
    'endRepeat',
] as const satisfies readonly (keyof Measure)[]

export function isRestSelected(
    selected: SlotData | null,
): selected is SlotData & { measure: Measure; self: NoteRest } {
    const self = selected?.self
    if (!selected?.measure || self == null) return false
    if (isNoteRest(self as unknown as NoteRest)) return true
    const body = asStaffOrNumber(self as never)
    return isNoteRest(body as unknown as NoteRest)
}

export function isNumberRestSelected(
    selected: SlotData | null,
): selected is SlotData & {measure: Measure; self: NoteNumber} {
    const self = selected?.self
    if (!selected?.measure || self == null || isMeasureAddMode(selected)) return false
    const body = asStaffOrNumber(self as never)
    // 选中简谱音符时 self 为 NotesNumberInfo（无 notesInfo），isSlotRestLike 会读 notesInfo.length 抛错
    if (!Array.isArray((body as Partial<NoteNumber>).notesInfo)) return false
    return isHostNoteNumberSlot(body) && isSlotRestLike(body)
}

function removeScoreAffiliatedById(musicScore: MusicScore, symbolId: string): boolean {
    const idx = musicScore.affiliatedSymbols.findIndex((sym) => sym.id === symbolId)
    if (idx < 0) return false
    musicScore.affiliatedSymbols.splice(idx, 1)
    return true
}

function collectNotesInfoIdsFromBody(body: unknown): string[] {
    if (body == null || typeof body !== 'object') return []
    const note = body as {
        notesInfo?: {id: string}[]
        graceNotes?: {id: string}[]
        graceNotesAfter?: {id: string}[]
    }
    if (!Array.isArray(note.notesInfo)) return []
    const ids = note.notesInfo.map((info) => info.id)
    for (const info of note.graceNotes ?? []) ids.push(info.id)
    for (const info of note.graceNotesAfter ?? []) ids.push(info.id)
    return ids
}

function collectNotesInfoIdsInMeasure(measure: Measure): string[] {
    const ids: string[] = []
    for (const raw of getMeasureSlots(measure)) {
        ids.push(...collectNotesInfoIdsFromBody(asStaffOrNumber(raw)))
    }
    return ids
}

function collectMeasureSlotIds(measure: Measure): string[] {
    return getMeasureSlots(measure).map((slot) => slot.id)
}

/** 删小节前：移除引用该小节或其中音符/列的曲谱级附属符号 */
function purgeScoreAffiliatedForMeasure(musicScore: MusicScore, measure: Measure): void {
    const noteIds = new Set(collectNotesInfoIdsInMeasure(measure))
    const slotIds = new Set(collectMeasureSlotIds(measure))
    musicScore.affiliatedSymbols = musicScore.affiliatedSymbols.filter((sym) => {
        if (sym.startId === measure.id || sym.endId === measure.id) return false
        if (noteIds.has(sym.startId) || noteIds.has(sym.endId)) return false
        if (slotIds.has(sym.startId) || slotIds.has(sym.endId)) return false
        return true
    })
}

function purgeScoreAffiliatedForNotesInfo(musicScore: MusicScore, notesInfoId: string): void {
    musicScore.affiliatedSymbols = musicScore.affiliatedSymbols.filter(
        (sym) => sym.startId !== notesInfoId && sym.endId !== notesInfoId,
    )
}

function purgeScoreAffiliatedForMeasureSlot(musicScore: MusicScore, slotId: string): void {
    musicScore.affiliatedSymbols = musicScore.affiliatedSymbols.filter(
        (sym) => sym.startId !== slotId && sym.endId !== slotId,
    )
}

function purgeScoreAffiliatedForNoteSymbol(musicScore: MusicScore, note: NoteSymbol): void {
    for (const id of collectNotesInfoIdsFromNote(note)) {
        purgeScoreAffiliatedForNotesInfo(musicScore, id)
    }
}

function collectNotesInfoIdsFromNote(note: NoteSymbol): string[] {
    const ids = note.notesInfo.map((info) => info.id)
    for (const info of note.graceNotes ?? []) ids.push(info.id)
    for (const info of note.graceNotesAfter ?? []) ids.push(info.id)
    return ids
}

/** 所有复谱表中第 staffIndex 个单谱表；任一复谱表只剩这 1 个单谱表时不可删 */
export function staffRowTargets(musicScore: MusicScore, staffIndex: number) {
    const rows = musicScore.grandStaffs
        .filter((grandStaff) => staffIndex >= 0 && staffIndex < grandStaff.staves.length)
        .map((grandStaff) => ({grandStaff, staff: grandStaff.staves[staffIndex]!}))
    const deletable = rows.length > 0 && rows.every((row) => row.grandStaff.staves.length > 1)
    return {rows, deletable}
}

/** 删除所有复谱表中第 staffIndex 个单谱表 */
export function deleteStaffRow(musicScore: MusicScore, staffIndex: number): boolean {
    const {rows, deletable} = staffRowTargets(musicScore, staffIndex)
    if (!deletable) return false
    for (const {grandStaff, staff} of rows) {
        for (const measure of staff.measures) purgeScoreAffiliatedForMeasure(musicScore, measure)
        deleteSingleStaff(grandStaff, staff)
    }
    return true
}

function deleteMeasureSlot(
    musicScore: MusicScore,
    slot: SlotData & { measure: Measure; singleStaff: NonNullable<SlotData['singleStaff']> },
): boolean {
    return deleteMeasureColumn(musicScore, slot.measure, (measure) => {
        purgeScoreAffiliatedForMeasure(musicScore, measure)
    })
}

/**
 * 选中小节时 Backspace：删小节（鼓谱为 preferredVoice，空则另一声部）最后一个槽位，小节本身保留。
 * 小节已空返回 false。
 */
export function deleteLastSlotInMeasure(
    musicScore: MusicScore,
    measure: Measure,
    preferredVoice: 'up' | 'down' = 'up',
): boolean {
    const notes = measure.notes
    let slots = notes as MeasureNoteSlot[]
    if (isMeasureNoteVoices(notes)) {
        const other = preferredVoice === 'up' ? 'down' : 'up'
        slots = (notes[preferredVoice]?.length ? notes[preferredVoice] : notes[other]) ?? []
    }
    const last = slots[slots.length - 1]
    if (!last) return false
    for (const id of collectNotesInfoIdsFromBody(asStaffOrNumber(last))) {
        purgeScoreAffiliatedForNotesInfo(musicScore, id)
    }
    purgeScoreAffiliatedForMeasureSlot(musicScore, last.id)
    slots.pop()
    return true
}

function deleteNumberHeadSlot(
    musicScore: MusicScore,
    slot: SlotData & {info: NotesNumberInfo; note: NoteNumber; measure: Measure},
): boolean {
    const {info, note, measure} = slot
    const notes = getMeasureNoteList(measure)
    const noteIndex = notes.findIndex((s) => slotSymbol(s) === note || s.id === note.id)
    if (noteIndex < 0) return false

    const infoIndex = note.notesInfo.findIndex((ni) => ni.id === info.id)
    if (infoIndex < 0) return false

    if (note.notesInfo.length <= 1) {
        purgeScoreAffiliatedForNotesInfo(musicScore, info.id)
        purgeScoreAffiliatedForMeasureSlot(musicScore, notes[noteIndex]!.id)
        notes.splice(noteIndex, 1)
    } else {
        purgeScoreAffiliatedForNotesInfo(musicScore, info.id)
        note.notesInfo.splice(infoIndex, 1)
    }
    return true
}

function deleteNoteHeadSlot(
    musicScore: MusicScore,
    slot: SlotData & { info: NotesInfo; note: NoteSymbol; measure: Measure },
): boolean {
    const {info, note, measure} = slot
    const notes = getMeasureNoteList(measure)
    const noteIndex = notes.findIndex((s) => slotSymbol(s) === note || s.id === note.id)
    if (noteIndex < 0) return false

    const infoIndex = note.notesInfo.findIndex((ni) => ni.id === info.id)
    if (infoIndex < 0) return false

    if (note.notesInfo.length <= 1) {
        purgeScoreAffiliatedForNoteSymbol(musicScore, note)
        purgeScoreAffiliatedForMeasureSlot(musicScore, notes[noteIndex]!.id)
        notes.splice(noteIndex, 1)
    } else {
        purgeScoreAffiliatedForNotesInfo(musicScore, info.id)
        note.notesInfo.splice(infoIndex, 1)
    }
    return true
}

/** TAB：删一条 TabNoteInfo；该槽只剩这一条时整列移除 */
function deleteTabInfoSlot(
    musicScore: MusicScore,
    slot: SlotData & {info: TabNoteInfo; note: TabNote; measure: Measure},
): boolean {
    const {info, note, measure} = slot
    const notes = getMeasureNoteList(measure)
    const noteIndex = notes.findIndex((s) => {
        const body = slotSymbol(s)
        return body === note || s.id === note.id || ('id' in body && body.id === note.id)
    })
    if (noteIndex < 0) return false

    const infoIndex = note.notesInfo.findIndex((ni) => ni.id === info.id)
    if (infoIndex < 0) return false

    if (note.notesInfo.length <= 1) {
        for (const ni of note.notesInfo) purgeScoreAffiliatedForNotesInfo(musicScore, ni.id)
        for (const g of note.graceNotes ?? []) purgeScoreAffiliatedForNotesInfo(musicScore, g.id)
        for (const g of note.graceNotesAfter ?? []) purgeScoreAffiliatedForNotesInfo(musicScore, g.id)
        purgeScoreAffiliatedForMeasureSlot(musicScore, notes[noteIndex]!.id)
        notes.splice(noteIndex, 1)
    } else {
        purgeScoreAffiliatedForNotesInfo(musicScore, info.id)
        note.notesInfo.splice(infoIndex, 1)
    }
    return true
}

function deleteRestSlot(slot: SlotData & { measure: Measure; self: NoteRest | unknown }): boolean {
    const {measure, self} = slot
    const restId =
        self && typeof self === 'object' && 'id' in self
            ? String((self as {id: string}).id)
            : null
    if (!restId) return false
    const notes = getMeasureNoteList(measure)
    const idx = notes.findIndex((item) => {
        if (item.id === restId) return true
        const body = slotSymbol(item)
        return isNoteRest(body) && body.id === restId
    })
    if (idx < 0) return false
    notes.splice(idx, 1)
    return true
}

function deleteNumberRestSlot(slot: SlotData & {measure: Measure; self: NoteNumber | unknown}): boolean {
    const {measure, self} = slot
    const notes = getMeasureNoteList(measure)
    const idx = notes.findIndex((item) => {
        if (self && typeof self === 'object' && 'id' in self && item.id === (self as {id?: string}).id) {
            return true
        }
        return slotSymbol(item) === self
    })
    if (idx < 0) {
        const fallback = findMeasureNoteIndex(measure, self as {id?: string})
        if (fallback < 0) return false
        notes.splice(fallback, 1)
        return true
    }
    notes.splice(idx, 1)
    return true
}

function deleteMeasureOptionalSymbol(slot: SlotData): boolean {
    const measure = slot.measure
    if (!measure) return false
    const selfId = (slot.self as { id?: string }).id
    if (!selfId) return false

    for (const key of MEASURE_OPTIONAL_SYMBOL_KEYS) {
        const symbol = measure[key]
        if (symbol && typeof symbol === 'object' && 'id' in symbol && symbol.id === selfId) {
            if (slot.grandStaff && slot.singleStaff) {
                const index = slot.singleStaff.measures.findIndex((m) => m.id === measure.id)
                deleteMeasureKeyInColumn(slot.grandStaff, index, measure, key)
            } else {
                delete measure[key]
            }
            return true
        }
    }
    return false
}

type MeasureOptionalSymbolKey = (typeof MEASURE_OPTIONAL_SYMBOL_KEYS)[number]

/** 连谱模式下谱表间的连谱小节线按各谱表同列小节绘制，删小节线需整列一起删 */
function deleteMeasureKeyInColumn(
    grandStaff: GrandStaff,
    measureIndex: number,
    measure: Measure,
    key: MeasureOptionalSymbolKey,
): void {
    const isBarline = key === 'barline_f' || key === 'barline_b'
    if (!isBarline || !grandStaff.linkedStaff || measureIndex < 0) {
        delete measure[key]
        return
    }
    for (const staff of grandStaff.staves) {
        const m = staff.measures[measureIndex]
        if (m) delete m[key]
    }
}

function deleteSingleNoteAffiliatedById(musicScore: MusicScore, symbolId: string): boolean {
    for (const grandStaff of musicScore.grandStaffs) {
        for (const singleStaff of grandStaff.staves) {
            for (const measure of singleStaff.measures) {
                for (const raw of getMeasureSlots(measure)) {
                    const slot = asStaffOrNumber(raw)
                    if (isNoteSymbol(slot)) {
                        for (const info of slot.notesInfo) {
                            const idx = info.affiliatedSymbols.findIndex((sym) => sym.id === symbolId)
                            if (idx >= 0) {
                                info.affiliatedSymbols.splice(idx, 1)
                                return true
                            }
                        }
                        continue
                    }
                    if (isHostNoteNumberSlot(slot)) {
                        const symbols = slot.affiliatedSymbols ?? []
                        const idx = symbols.findIndex((sym) => sym.id === symbolId)
                        if (idx >= 0) {
                            slot.affiliatedSymbols = symbols
                            slot.affiliatedSymbols.splice(idx, 1)
                            return true
                        }
                        continue
                    }
                    if (isNoteRest(slot) && slot.affiliatedSymbols?.length) {
                        const idx = slot.affiliatedSymbols.findIndex((sym) => sym.id === symbolId)
                        if (idx >= 0) {
                            slot.affiliatedSymbols.splice(idx, 1)
                            return true
                        }
                    }
                }
            }
        }
    }
    return false
}

function deleteMeasureAffiliatedById(slot: SlotData, symbolId: string): boolean {
    const measure = slot.measure
    if (!measure?.affiliatedSymbols?.length) return false
    const idx = measure.affiliatedSymbols.findIndex((sym) => sym.id === symbolId)
    if (idx < 0) return false
    measure.affiliatedSymbols.splice(idx, 1)
    return true
}

function deleteMeasureAffiliatedByIdGlobal(musicScore: MusicScore, symbolId: string): boolean {
    for (const grandStaff of musicScore.grandStaffs) {
        for (const singleStaff of grandStaff.staves) {
            for (const measure of singleStaff.measures) {
                if (!measure.affiliatedSymbols?.length) continue
                const idx = measure.affiliatedSymbols.findIndex((sym) => sym.id === symbolId)
                if (idx >= 0) {
                    measure.affiliatedSymbols.splice(idx, 1)
                    return true
                }
            }
        }
    }
    return false
}

function deleteNotesInfoSubSymbol(slot: SlotData, symbolId: string): boolean {
    const info = slot.info
    if (!info) return false
    if ('accidental' in info && info.accidental?.id === symbolId) {
        delete info.accidental
        return true
    }
    if ('augmentationDot' in info && info.augmentationDot?.id === symbolId) {
        delete info.augmentationDot
        return true
    }
    return false
}

/**
 * 按当前选中项删除曲谱数据。
 * 数组父级：measure.notes、notesInfo、affiliatedSymbols 等 splice；
 * 对象父级：measure 可选符号字段 delete。
 */
export function deleteSelectedItem(musicScore: MusicScore, selected: SlotData | null): boolean {
    if (!selected) return false

    if (isBendSelected(selected) && selected.info) {
        setTabNoteInfoBend(selected.info as unknown as TabNoteInfo, null)
        return true
    }

    if (isVoltaSelected(selected)) {
        removeVolta(musicScore, selected.self.id)
        return true
    }

    if (isBracketSelected(selected)) {
        return removeBracket(selected.grandStaff)
    }

    if (isSlurSelected(selected)) {
        return removeScoreAffiliatedById(musicScore, selected.self.id)
    }

    if (
        isArpeggioSelected(selected)
        || isStrummingSelected(selected)
        || isPreludeBracketSelected(selected)
    ) {
        return removeSlotAffiliatedSymbol(musicScore, selected.self.id)
    }

    if (
        isPedalSelected(selected)
        || isPitchSelected(selected)
        || isLineSelected(selected)
    ) {
        return removeScoreAffiliatedById(musicScore, selected.self.id)
    }

    if (isMeasureAffiliatedSelected(selected)) {
        return removeMeasureAffiliated(selected.measure, selected.self.id)
    }

    // 必须早于音符头 / 休止符判断：选中单音符附属时 note / info 指向其宿主
    if (isNoteAffiliatedSelected(selected)) {
        const located = locateNoteAffiliatedById(musicScore, selected.self.id)
        return located ? removeNoteMark(located.host, selected.self.id) : false
    }

    if (isGraceNoteSelected(selected) && selected.note && selected.info) {
        purgeScoreAffiliatedForNotesInfo(musicScore, selected.info.id)
        return removeGraceById(selected.note as never, selected.info.id)
    }

    if (selected.measure && isDrumNotesInfo(selected.info) && selected.self === selected.info) {
        const note = selected.note as unknown as DrumNote | null
        const ids = note && note.notesInfo.length <= 1 ? note.notesInfo.map((info) => info.id) : [selected.info.id]
        if (!removeDrumNotesInfo(selected.measure, selected.info.id)) return false
        for (const id of ids) purgeScoreAffiliatedForNotesInfo(musicScore, id)
        return true
    }

    if (selected.measure && isDrumRestBody(selected.self as unknown as MeasureNoteSymbol)) {
        return removeDrumRest(selected.measure, (selected.self as {id: string}).id)
    }

    // 五线 isNoteHeadSelected 故意排除 TAB；TAB 音符 / 琶音 / 扫弦走这里
    if (isTabInfoSelected(selected)) {
        return deleteTabInfoSlot(musicScore, selected as SlotData & {
            info: TabNoteInfo
            note: TabNote
            measure: Measure
        })
    }

    if (isNoteHeadSelected(selected)) {
        return deleteNoteHeadSlot(musicScore, selected)
    }

    if (isNumberHeadSelected(selected)) {
        return deleteNumberHeadSlot(musicScore, selected)
    }

    if (isMeasureAddMode(selected)) {
        if (!selected.singleStaff) return false
        return deleteMeasureSlot(musicScore, selected as SlotData & {
            measure: Measure
            singleStaff: NonNullable<SlotData['singleStaff']>
        })
    }

    if (isRestSelected(selected)) {
        return deleteRestSlot(selected)
    }

    if (isNumberRestSelected(selected)) {
        return deleteNumberRestSlot(selected)
    }

    if (deleteMeasureOptionalSymbol(selected)) {
        return true
    }

    const selfId = selected.self && typeof selected.self === 'object' && 'id' in selected.self
        ? String(selected.self.id)
        : null
    if (!selfId) return false

    if (deleteNotesInfoSubSymbol(selected, selfId)) {
        return true
    }

    if (selected.measure && deleteMeasureAffiliatedById(selected, selfId)) {
        return true
    }

    if (deleteMeasureAffiliatedByIdGlobal(musicScore, selfId)) {
        return true
    }

    if (deleteSingleNoteAffiliatedById(musicScore, selfId)) {
        return true
    }

    if (deleteMeasureOptionalSymbolById(musicScore, selfId)) {
        return true
    }

    return removeScoreAffiliatedById(musicScore, selfId)
}

function deleteMeasureOptionalSymbolById(musicScore: MusicScore, symbolId: string): boolean {
    for (const grandStaff of musicScore.grandStaffs) {
        for (const singleStaff of grandStaff.staves) {
            for (let mi = 0; mi < singleStaff.measures.length; mi++) {
                const measure = singleStaff.measures[mi]!
                for (const key of MEASURE_OPTIONAL_SYMBOL_KEYS) {
                    const symbol = measure[key]
                    if (symbol && typeof symbol === 'object' && 'id' in symbol && symbol.id === symbolId) {
                        deleteMeasureKeyInColumn(grandStaff, mi, measure, key)
                        return true
                    }
                }
            }
        }
    }
    return false
}
