import GuitarChordModel from '../models/GuitarChordModel'
import {
  DEFAULT_GUITAR_CHORD_SEEDS,
  seedHandPoseJson,
  seedTabChordJson
} from '../resources/guitarChordSeeds'
import {
  DEFAULT_UKULELE_CHORD_SEEDS,
  seedUkuleleTabChordJson
} from '../resources/ukuleleChordSeeds'
import { DEFAULT_BASS5_CHORD_SEEDS, seedBass5TabChordJson } from '../resources/bass5ChordSeeds'

/** 写入/补齐内置吉他九和弦（已有同 id 或同名 tab6 则跳过） */
export async function syncBuiltinGuitarChords() {
  for (const seed of DEFAULT_GUITAR_CHORD_SEEDS) {
    const byId = await GuitarChordModel.findByPk(seed.dbId, { paranoid: false })
    const byName = await GuitarChordModel.findOne({
      where: { name: seed.name, tab_type: 'tab6' },
      paranoid: false
    })
    if (byId || byName) continue
    try {
      await GuitarChordModel.create({
        id: seed.dbId,
        name: seed.name,
        data: seedTabChordJson(seed),
        hand_pose: seedHandPoseJson(seed.name),
        tab_type: 'tab6'
      })
    } catch {
      /* id 冲突或并发 */
    }
  }
}

/** 写入/补齐内置尤克里里九和弦（无手型；已有同 id 或同名 tab4 则跳过） */
export async function syncBuiltinUkuleleChords() {
  for (const seed of DEFAULT_UKULELE_CHORD_SEEDS) {
    const byId = await GuitarChordModel.findByPk(seed.dbId, { paranoid: false })
    const byName = await GuitarChordModel.findOne({
      where: { name: seed.name, tab_type: 'tab4' },
      paranoid: false
    })
    if (byId || byName) continue
    try {
      await GuitarChordModel.create({
        id: seed.dbId,
        name: seed.name,
        data: seedUkuleleTabChordJson(seed),
        hand_pose: null,
        tab_type: 'tab4'
      })
    } catch {
      /* id 冲突或并发 */
    }
  }
}

/** 写入/补齐内置五弦（贝斯）九和弦（无手型；已有同 id 或同名 tab5 则跳过） */
export async function syncBuiltinBass5Chords() {
  for (const seed of DEFAULT_BASS5_CHORD_SEEDS) {
    const byId = await GuitarChordModel.findByPk(seed.dbId, { paranoid: false })
    const byName = await GuitarChordModel.findOne({
      where: { name: seed.name, tab_type: 'tab5' },
      paranoid: false
    })
    if (byId || byName) continue
    try {
      await GuitarChordModel.create({
        id: seed.dbId,
        name: seed.name,
        data: seedBass5TabChordJson(seed),
        hand_pose: null,
        tab_type: 'tab5'
      })
    } catch {
      /* id 冲突或并发 */
    }
  }
}
