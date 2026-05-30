import { ref } from 'vue'

import { cartdeckDb } from '@/db/cartdeckDb'
import { sha256Hex } from '@/utils/hashUtils'
import { readRomTitle, cleanFilename, getRomType, getDisplayTitle } from '@/utils/romUtils'

const roms = ref([])
const loaded = ref(false)

function sortRoms(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.lastPlayedAt || left.createdAt || 0).getTime()
    const rightTime = new Date(right.lastPlayedAt || right.createdAt || 0).getTime()
    return rightTime - leftTime
  })
}

export function useRomLibrary() {
  async function loadRoms() {
    roms.value = sortRoms(await cartdeckDb.roms.toArray())
    loaded.value = true
    return roms.value
  }

  async function getRom(id) {
    return cartdeckDb.roms.get(id)
  }

  async function getAllRoms() {
    return loadRoms()
  }

  async function getLatestRom(latestRomId = null) {
    if (latestRomId) {
      const exactMatch = await getRom(latestRomId)
      if (exactMatch) {
        return exactMatch
      }
    }

    const items = loaded.value ? roms.value : await loadRoms()
    return items[0] ?? null
  }

  async function addRom({ romFile, romBytes, customTitle = '', coverImageFile = null }) {
    const id = await sha256Hex(romBytes)
    const existingRecord = await getRom(id)
    if (existingRecord) {
      await loadRoms()
      return {
        ...existingRecord,
        wasDuplicate: true,
      }
    }

    const now = new Date().toISOString()
    const title = readRomTitle(romBytes) || cleanFilename(romFile.name)
    const record = {
      id,
      title,
      customTitle: customTitle.trim(),
      filename: romFile.name,
      extension: romFile.name.toLowerCase().endsWith('.gbc') ? 'gbc' : 'gb',
      size: romFile.size,
      mimeType: romFile.type || 'application/octet-stream',
      romBytes,
      coverImageBlob: coverImageFile ?? null,
      coverImageType: coverImageFile?.type ?? null,
      defaultCoverKey: 'default',
      createdAt: now,
      updatedAt: now,
      lastPlayedAt: null,
      typeLabel: getRomType(romFile.name, romBytes),
      displayTitle: customTitle.trim() || title,
    }

    await cartdeckDb.roms.put(record)
    await loadRoms()
    return record
  }

  async function updateRomMetadata(id, { customTitle, coverImageBlob, coverImageType }) {
    const record = await getRom(id)
    if (!record) {
      return null
    }

    const nextRecord = {
      ...record,
      customTitle: customTitle?.trim() ?? record.customTitle,
      coverImageBlob: coverImageBlob ?? record.coverImageBlob,
      coverImageType: coverImageType ?? record.coverImageType,
      updatedAt: new Date().toISOString(),
    }

    nextRecord.displayTitle = getDisplayTitle(nextRecord)
    await cartdeckDb.roms.put(nextRecord)
    await loadRoms()
    return nextRecord
  }

  async function removeCoverImage(id) {
    return updateRomMetadata(id, {
      coverImageBlob: null,
      coverImageType: null,
    })
  }

  async function deleteRom(id) {
    await cartdeckDb.roms.delete(id)
    await cartdeckDb.saves.where('romId').equals(id).delete()
    await loadRoms()
  }

  async function deleteAllRoms() {
    await cartdeckDb.roms.clear()
    await cartdeckDb.saves.clear()
    await loadRoms()
  }

  async function updateLastPlayed(id) {
    const record = await getRom(id)
    if (!record) {
      return null
    }

    record.lastPlayedAt = new Date().toISOString()
    await cartdeckDb.roms.put(record)
    await loadRoms()
    return record
  }

  async function clearLibrary() {
    return deleteAllRoms()
  }

  return {
    roms,
    loaded,
    loadRoms,
    addRom,
    getRom,
    getAllRoms,
    getLatestRom,
    updateRomMetadata,
    removeCoverImage,
    deleteRom,
    deleteAllRoms,
    updateLastPlayed,
    clearLibrary,
  }
}
