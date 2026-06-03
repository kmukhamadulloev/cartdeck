import { computed, ref } from 'vue'

import { cartdeckDb } from '@/db/cartdeckDb'

const DEFAULT_SETTINGS = {
  latestRomId: null,
  selectedTheme: 'system',
  consoleTheme: 'gray',
  selectedBackgroundKey: 'default',
  customBackgroundBlob: null,
  animationMode: 'full',
  persistentStorageDismissed: false,
}

const loaded = ref(false)
const isSettingsOpen = ref(false)
const state = {
  latestRomId: ref(DEFAULT_SETTINGS.latestRomId),
  selectedTheme: ref(DEFAULT_SETTINGS.selectedTheme),
  consoleTheme: ref(DEFAULT_SETTINGS.consoleTheme),
  selectedBackgroundKey: ref(DEFAULT_SETTINGS.selectedBackgroundKey),
  customBackgroundBlob: ref(DEFAULT_SETTINGS.customBackgroundBlob),
  animationMode: ref(DEFAULT_SETTINGS.animationMode),
  persistentStorageDismissed: ref(DEFAULT_SETTINGS.persistentStorageDismissed),
}

async function saveSetting(key, value) {
  await cartdeckDb.settings.put({ key, value })
}

async function loadSettings() {
  const records = await cartdeckDb.settings.toArray()
  const recordsByKey = new Map(records.map((record) => [record.key, record.value]))

  Object.entries(DEFAULT_SETTINGS).forEach(([key, defaultValue]) => {
    state[key].value = recordsByKey.has(key) ? recordsByKey.get(key) : defaultValue
  })

  loaded.value = true
}

export function useSettings() {
  async function ensureLoaded() {
    if (!loaded.value) {
      await loadSettings()
    }
  }

  async function setLatestRomId(id) {
    state.latestRomId.value = id
    await saveSetting('latestRomId', id)
  }

  async function setTheme(theme) {
    state.selectedTheme.value = theme
    await saveSetting('selectedTheme', theme)
  }

  async function setConsoleTheme(theme) {
    state.consoleTheme.value = theme
    await saveSetting('consoleTheme', theme)
  }

  async function setBackgroundKey(key) {
    state.selectedBackgroundKey.value = key
    await saveSetting('selectedBackgroundKey', key)
  }

  async function setCustomBackgroundBlob(blob) {
    state.customBackgroundBlob.value = blob
    await saveSetting('customBackgroundBlob', blob)
  }

  async function setAnimationMode(mode) {
    state.animationMode.value = mode
    await saveSetting('animationMode', mode)
  }

  async function setPersistentStorageDismissed(value) {
    state.persistentStorageDismissed.value = value
    await saveSetting('persistentStorageDismissed', value)
  }

  async function clearAllLocalData() {
    await cartdeckDb.transaction('rw', cartdeckDb.roms, cartdeckDb.settings, cartdeckDb.saves, async () => {
      await cartdeckDb.roms.clear()
      await cartdeckDb.settings.clear()
      await cartdeckDb.saves.clear()
    })

    Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
      state[key].value = value
    })
  }

  function openSettings() {
    isSettingsOpen.value = true
  }

  function closeSettings() {
    isSettingsOpen.value = false
  }

  return {
    loaded: computed(() => loaded.value),
    isSettingsOpen,
    latestRomId: state.latestRomId,
    selectedTheme: state.selectedTheme,
    consoleTheme: state.consoleTheme,
    selectedBackgroundKey: state.selectedBackgroundKey,
    customBackgroundBlob: state.customBackgroundBlob,
    animationMode: state.animationMode,
    persistentStorageDismissed: state.persistentStorageDismissed,
    ensureLoaded,
    setLatestRomId,
    setTheme,
    setConsoleTheme,
    setBackgroundKey,
    setCustomBackgroundBlob,
    setAnimationMode,
    setPersistentStorageDismissed,
    clearAllLocalData,
    openSettings,
    closeSettings,
  }
}
