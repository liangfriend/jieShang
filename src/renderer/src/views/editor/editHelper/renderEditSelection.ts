import {getMeasureSlots, isNoteRest, isNoteSymbol, MusicScoreTypeEnum, slotSymbol} from '@deciphony/renderer'
import type {
    MusicScore,
    SlotData,
    VDom,
} from '@deciphony/renderer'
import {
    locateDrumNotesInfoById,
    locateDrumRestById,
    locateGrandStaff,
    locateMeasure,
    locateNoteSlot,
    locateNotesInfoById,
    locateNotesNumberInfoById,
    locateSingleStaff,
    locateTabBendById,
    locateTabNoteInfoById,
} from '@deciphony/extensions/dr-edit/score-builder'
import {locateNoteAffiliatedById} from './renderEditNoteAffiliatedDrag'
import {findSlotAffiliatedSymbol} from './renderEditSlotAffiliated'
import {locateMeasureAffiliatedById} from './renderEditMeasureAffiliatedDrag'

const MEASURE_SYMBOL_KEYS = [
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
] as const

function buildSlotData(
    musicScore: MusicScore,
    ctx: {
        grandStaff?: SlotData['grandStaff']
        singleStaff?: SlotData['singleStaff']
        measure?: SlotData['measure']
        note?: SlotData['note']
        info?: SlotData['info']
        self: SlotData['self']
    },
): SlotData {
    return {
        musicScore,
        grandStaff: ctx.grandStaff ?? null,
        singleStaff: ctx.singleStaff ?? null,
        measure: ctx.measure ?? null,
        note: ctx.note ?? null,
        info: ctx.info ?? null,
        self: ctx.self,
    }
}

function findMeasureById(musicScore: MusicScore, id: string) {
    for (const grandStaff of musicScore.grandStaffs) {
        for (const singleStaff of grandStaff.staves) {
            for (const measure of singleStaff.measures) {
                if (measure.id === id) {
                    return locateMeasure(musicScore, measure)
                }
            }
        }
    }
    return null
}

function findNoteSlotById(musicScore: MusicScore, id: string) {
    for (const grandStaff of musicScore.grandStaffs) {
        for (const singleStaff of grandStaff.staves) {
            for (const measure of singleStaff.measures) {
                for (const slot of getMeasureSlots(measure)) {
                    if (slot.id === id) {
                        return locateNoteSlot(musicScore, slot)
                    }
                    const body = slotSymbol(slot)
                    if (body && typeof body === 'object' && 'id' in body && body.id === id) {
                        return locateNoteSlot(musicScore, slot)
                    }
                }
            }
        }
    }
    return null
}

function findMeasureSymbolById(musicScore: MusicScore, id: string) {
    for (const grandStaff of musicScore.grandStaffs) {
        for (const singleStaff of grandStaff.staves) {
            for (const measure of singleStaff.measures) {
                for (const key of MEASURE_SYMBOL_KEYS) {
                    const symbol = measure[key]
                    if (symbol && typeof symbol === 'object' && 'id' in symbol && symbol.id === id) {
                        return {located: locateMeasure(musicScore, measure), symbol}
                    }
                }
            }
        }
    }
    return null
}

function findAffiliatedSymbolById(musicScore: MusicScore, id: string) {
    return musicScore.affiliatedSymbols.find((sym) => sym.id === id)
        ?? findSlotAffiliatedSymbol(musicScore, id)
}

/** 鼓谱音符头 / 休止符在 up、down 两个声部里查找 */
function drumSlotDataFromVDom(musicScore: MusicScore, tag: VDom['tag'], id: string): SlotData | null {
    if (tag === 'noteHead' || tag === 'noteStem' || tag === 'noteTail') {
        const located = locateDrumNotesInfoById(musicScore, id)
        if (!located) return null
        return buildSlotData(musicScore, {
            grandStaff: located.grandStaff,
            singleStaff: located.singleStaff,
            measure: located.measure,
            note: located.note as unknown as SlotData['note'],
            info: located.info as unknown as SlotData['info'],
            self: located.info as unknown as SlotData['self'],
        })
    }
    if (tag === 'rest') {
        const located = locateDrumRestById(musicScore, id)
        if (!located) return null
        return buildSlotData(musicScore, {
            grandStaff: located.grandStaff,
            singleStaff: located.singleStaff,
            measure: located.measure,
            self: located.rest as unknown as SlotData['self'],
        })
    }
    return null
}

/** 将 dr-click 的 vDom 解析为 SlotData，供编辑选中态使用 */
export function slotDataFromVDom(musicScore: MusicScore, vdom: VDom): SlotData | null {
    if (vdom.tag === 'slot' && vdom.slotData) {
        return vdom.slotData
    }

    const id = vdom.targetId
    if (!id) return null

    if (vdom.tag === 'affiliation' && vdom.special?.slur) {
        const sym = findAffiliatedSymbolById(musicScore, id)
        if (sym) {
            return buildSlotData(musicScore, {self: sym as unknown as SlotData['self']})
        }
    }

    if (
        vdom.tag === 'affiliation'
        && (vdom.special?.arpeggio
            || vdom.special?.strumming
            || vdom.special?.pedal
            || vdom.special?.pitch
            || vdom.special?.trill
            || vdom.special?.hairpin
            || vdom.special?.guzhengLian)
    ) {
        const sym = findAffiliatedSymbolById(musicScore, id)
        if (sym) {
            return buildSlotData(musicScore, {self: sym as unknown as SlotData['self']})
        }
    }

    if (vdom.tag === 'affiliation' && vdom.special?.volta != null) {
        const sym = findAffiliatedSymbolById(musicScore, id)
        if (sym) {
            return buildSlotData(musicScore, {self: sym as unknown as SlotData['self']})
        }
    }

    // 单音符附属：note / info 指向宿主，self 为符号本身
    // 单 slot 皮肤类（前奏括号等）：挂在 MeasureNoteSlot.affiliatedSymbols
    if (vdom.tag === 'affiliation') {
        const located = locateNoteAffiliatedById(musicScore, id)
        if (located) {
            return buildSlotData(musicScore, {
                grandStaff: located.grandStaff,
                singleStaff: located.singleStaff,
                measure: located.measure,
                note: located.note as SlotData['note'],
                info: located.info as SlotData['info'],
                self: located.symbol as unknown as SlotData['self'],
            })
        }
        const slotAffiliated = findSlotAffiliatedSymbol(musicScore, id)
        if (slotAffiliated) {
            return buildSlotData(musicScore, {
                self: slotAffiliated as unknown as SlotData['self'],
            })
        }
        // 单小节附属（自定义小节符号）：measure 指向宿主小节，self 为符号本身
        const measureAffiliated = locateMeasureAffiliatedById(musicScore, id)
        if (measureAffiliated) {
            return buildSlotData(musicScore, {
                grandStaff: measureAffiliated.grandStaff,
                singleStaff: measureAffiliated.singleStaff,
                measure: measureAffiliated.measure,
                self: measureAffiliated.symbol as unknown as SlotData['self'],
            })
        }
    }

    if (vdom.tag === 'tabNoteNumber' || vdom.tag === 'arpeggio' || vdom.tag === 'strumming') {
        const located = locateTabNoteInfoById(musicScore, id)
        if (located) {
            return buildSlotData(musicScore, {
                grandStaff: located.grandStaff,
                singleStaff: located.singleStaff,
                measure: located.measure,
                note: located.note as unknown as SlotData['note'],
                info: located.info as unknown as SlotData['info'],
                self: located.info as unknown as SlotData['self'],
            })
        }
    }

    if (vdom.tag === 'bend') {
        const located = locateTabBendById(musicScore, id)
        if (located) {
            return buildSlotData(musicScore, {
                grandStaff: located.grandStaff,
                singleStaff: located.singleStaff,
                measure: located.measure,
                note: located.note as unknown as SlotData['note'],
                info: located.info as unknown as SlotData['info'],
                self: located.bend as unknown as SlotData['self'],
            })
        }
    }

    if (musicScore.type === MusicScoreTypeEnum.DrumNotation) {
        const drumSlot = drumSlotDataFromVDom(musicScore, vdom.tag, id)
        if (drumSlot) return drumSlot
    }

    if (
        vdom.tag === 'noteHead'
        || vdom.tag === 'noteNumber'
        || vdom.tag === 'noteStem'
        || vdom.tag === 'noteTail'
        || vdom.tag === 'addLine'
    ) {
        const located = locateNotesInfoById(musicScore, id)
        if (located) {
            return buildSlotData(musicScore, {
                grandStaff: located.grandStaff,
                singleStaff: located.singleStaff,
                measure: located.measure,
                note: located.note,
                info: located.notesInfo,
                self: located.notesInfo,
            })
        }
        const numberLocated = locateNotesNumberInfoById(musicScore, id)
        if (numberLocated) {
            return buildSlotData(musicScore, {
                grandStaff: numberLocated.grandStaff,
                singleStaff: numberLocated.singleStaff,
                measure: numberLocated.measure,
                note: numberLocated.note,
                info: numberLocated.notesNumberInfo,
                self: numberLocated.notesNumberInfo,
            })
        }
        // Tab 符干/符尾/加时线与品格共用 info.id
        const tabLocated = locateTabNoteInfoById(musicScore, id)
        if (tabLocated) {
            return buildSlotData(musicScore, {
                grandStaff: tabLocated.grandStaff,
                singleStaff: tabLocated.singleStaff,
                measure: tabLocated.measure,
                note: tabLocated.note as unknown as SlotData['note'],
                info: tabLocated.info as unknown as SlotData['info'],
                self: tabLocated.info as unknown as SlotData['self'],
            })
        }
    }

    if (vdom.tag === 'rest') {
        const located = findNoteSlotById(musicScore, id)
        if (located) {
            const body = slotSymbol(located.slot)
            return buildSlotData(musicScore, {
                grandStaff: located.grandStaff,
                singleStaff: located.singleStaff,
                measure: located.measure,
                note: isNoteSymbol(body) ? body : null,
                self: (isNoteRest(body) ? body : body) as unknown as SlotData['self'],
            })
        }
        // 简谱休止符 targetId 为休止 notesInfo.id；self 取 NoteNumber 以走休止符属性栏
        const numberRest = locateNotesNumberInfoById(musicScore, id)
        if (numberRest) {
            return buildSlotData(musicScore, {
                grandStaff: numberRest.grandStaff,
                singleStaff: numberRest.singleStaff,
                measure: numberRest.measure,
                note: numberRest.note,
                self: numberRest.note as unknown as SlotData['self'],
            })
        }
    }

    // 鼓谱长休止符及其小节数的 targetId 为所在小节 id
    if (vdom.tag === 'measure' || vdom.tag === 'longRest' || vdom.tag === 'longRestNumber') {
        const located = findMeasureById(musicScore, id)
        if (located) {
            return buildSlotData(musicScore, {
                grandStaff: located.grandStaff,
                singleStaff: located.singleStaff,
                measure: located.measure,
                self: located.measure,
            })
        }
    }

    const measureSymbol = findMeasureSymbolById(musicScore, id)
    if (measureSymbol?.located) {
        return buildSlotData(musicScore, {
            grandStaff: measureSymbol.located.grandStaff,
            singleStaff: measureSymbol.located.singleStaff,
            measure: measureSymbol.located.measure,
            self: measureSymbol.symbol as unknown as SlotData['self'],
        })
    }

    const noteLocated = findNoteSlotById(musicScore, id)
    if (noteLocated) {
        const body = slotSymbol(noteLocated.slot)
        const note = isNoteSymbol(body) ? body : null
        return buildSlotData(musicScore, {
            grandStaff: noteLocated.grandStaff,
            singleStaff: noteLocated.singleStaff,
            measure: noteLocated.measure,
            note,
            self: (note ?? body ?? noteLocated.slot) as unknown as SlotData['self'],
        })
    }

    for (const grandStaff of musicScore.grandStaffs) {
        if (grandStaff.id === id) {
            return buildSlotData(musicScore, {grandStaff, self: grandStaff})
        }
        if (grandStaff.bracket?.id === id) {
            const located = locateGrandStaff(musicScore, grandStaff)
            if (located) {
                return buildSlotData(musicScore, {
                    grandStaff: located.grandStaff,
                    self: grandStaff.bracket as unknown as SlotData['self'],
                })
            }
        }
        for (const singleStaff of grandStaff.staves) {
            if (singleStaff.id === id) {
                const located = locateSingleStaff(musicScore, singleStaff)
                if (located) {
                    return buildSlotData(musicScore, {
                        grandStaff: located.grandStaff,
                        singleStaff: located.singleStaff,
                        self: singleStaff,
                    })
                }
            }
        }
    }

    const affiliated = findAffiliatedSymbolById(musicScore, id)
    if (affiliated) {
        return buildSlotData(musicScore, {self: affiliated as unknown as SlotData['self']})
    }

    const measureLocated = findMeasureById(musicScore, id)
    if (measureLocated) {
        return buildSlotData(musicScore, {
            grandStaff: measureLocated.grandStaff,
            singleStaff: measureLocated.singleStaff,
            measure: measureLocated.measure,
            self: measureLocated.measure,
        })
    }

    return null
}

export function vdomSelectionKey(vdom: VDom): string {
    return `${vdom.tag}:${vdom.targetId ?? ''}`
}
