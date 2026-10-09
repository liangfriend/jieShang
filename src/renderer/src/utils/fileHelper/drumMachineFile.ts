import type {
  DrumMachineData,
  DrumMachineListItem,
  DrumMachineRecord
} from '@renderer/types/drumMachine'
import {
  normalizeDrumMachineData,
  toPlainDrumMachineData
} from '@renderer/utils/drumMachine/pattern'

function mapRecord(row: {
  id: number
  name: string
  data?: string
  created_at?: string
  updated_at?: string
}): DrumMachineRecord {
  return {
    id: row.id,
    name: row.name,
    data: normalizeDrumMachineData(row.data),
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

export async function listDrumMachines(keyword = ''): Promise<DrumMachineListItem[]> {
  const res = await window.api.drumMachine.list(keyword.trim() || undefined)
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data.map((row: DrumMachineListItem) => ({
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at
  }))
}

export async function getDrumMachine(id: number): Promise<DrumMachineRecord> {
  const res = await window.api.drumMachine.get(id)
  if (!res?.success || !res.data) throw new Error(res?.error || 'drum machine not found')
  return mapRecord(res.data)
}

export async function createDrumMachine(name: string, data: DrumMachineData): Promise<DrumMachineRecord> {
  const res = await window.api.drumMachine.create({
    name: name.trim(),
    data: toPlainDrumMachineData(data)
  })
  if (!res?.success || !res.data) throw new Error(res?.error || 'create drum machine failed')
  return mapRecord(res.data)
}

export async function updateDrumMachine(
  id: number,
  name: string,
  data: DrumMachineData
): Promise<DrumMachineRecord> {
  const res = await window.api.drumMachine.update(id, {
    name: name.trim(),
    data: toPlainDrumMachineData(data)
  })
  if (!res?.success || !res.data) throw new Error(res?.error || 'update drum machine failed')
  return mapRecord(res.data)
}

export async function deleteDrumMachine(id: number): Promise<void> {
  const res = await window.api.drumMachine.delete(id)
  if (!res?.success) throw new Error(res?.error || 'delete drum machine failed')
}
