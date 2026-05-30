import { ref } from 'vue'

import { normalizeStorageEstimate } from '@/utils/storageUtils'

const isSupported = typeof navigator !== 'undefined' && 'storage' in navigator
const persisted = ref(false)
const estimate = ref(normalizeStorageEstimate())
const isLoading = ref(false)

export function usePersistentStorage() {
  async function refresh() {
    if (!isSupported) {
      return { persisted: false, estimate: estimate.value }
    }

    isLoading.value = true

    try {
      persisted.value = await navigator.storage.persisted()
      estimate.value = normalizeStorageEstimate(await navigator.storage.estimate())
    } finally {
      isLoading.value = false
    }

    return {
      persisted: persisted.value,
      estimate: estimate.value,
    }
  }

  async function requestPersistence() {
    if (!isSupported || !navigator.storage.persist) {
      return false
    }

    const granted = await navigator.storage.persist()
    await refresh()
    return granted
  }

  return {
    isSupported,
    persisted,
    estimate,
    isLoading,
    refresh,
    requestPersistence,
  }
}
