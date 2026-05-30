import { ref } from 'vue'

import { cartdeckDb } from '@/db/cartdeckDb'

const status = ref('idle')
const error = ref('')
const canSaveStates = ref(false)
const isMuted = ref(false)

let wasmBoyModule = null
let wasmBoy = null
let currentRomId = null
let lifecycleToken = 0

async function loadWasmBoyModule() {
  if (wasmBoyModule) {
    return wasmBoyModule
  }

  wasmBoyModule = await import('wasmboy/dist/wasmboy.wasm.esm.js')
  return wasmBoyModule
}

function mapJoypadState(joypadState) {
  return {
    UP: joypadState.up,
    RIGHT: joypadState.right,
    DOWN: joypadState.down,
    LEFT: joypadState.left,
    A: joypadState.a,
    B: joypadState.b,
    START: joypadState.start,
    SELECT: joypadState.select,
  }
}

export function useEmulator() {
  function resetState() {
    currentRomId = null
    canSaveStates.value = false
    isMuted.value = false
    status.value = 'idle'
    error.value = ''
  }

  async function init(canvas) {
    const initToken = ++lifecycleToken
    status.value = 'loading'
    error.value = ''

    try {
      const module = await loadWasmBoyModule()
      const nextWasmBoy = module.WasmBoy

      if (initToken !== lifecycleToken) {
        await nextWasmBoy.pause?.()
        return false
      }

      wasmBoy = nextWasmBoy

      await wasmBoy.config(
        {
          headless: false,
          useGbcWhenOptional: true,
          saveInBrowser: false,
        },
        canvas,
      )

      if (initToken !== lifecycleToken) {
        await wasmBoy.pause?.()
        return false
      }

      wasmBoy.disableDefaultJoypad?.()
      await wasmBoy.setCanvas(canvas)
      canSaveStates.value =
        typeof wasmBoy.saveState === 'function' && typeof wasmBoy.loadState === 'function'
      isMuted.value = false
      status.value = 'ready'
      return true
    } catch (caughtError) {
      console.error('Failed to initialize WasmBoy:', caughtError)
      status.value = 'error'
      error.value = 'The emulator could not be initialized in this browser session.'
      return false
    }
  }

  async function loadRom(record) {
    if (!record || !wasmBoy) {
      return false
    }

    status.value = 'loading-rom'
    error.value = ''

    try {
      await wasmBoy.loadROM(record.romBytes)
      currentRomId = record.id

      // loadROM internally re-enables the default joypad via Q.initialize(),
      // which overwrites custom joypad state every frame — must re-disable.
      wasmBoy.disableDefaultJoypad?.()

      status.value = 'loaded'
      return true
    } catch (caughtError) {
      console.error('Failed to load ROM:', caughtError)
      status.value = 'error'
      error.value = 'This ROM could not be loaded by the emulator.'
      return false
    }
  }

  async function play() {
    if (!wasmBoy) {
      return
    }

    await wasmBoy.resumeAudioContext()
    syncAudioMuteState()
    await wasmBoy.play()
    status.value = 'playing'
  }

  async function pause() {
    if (wasmBoy?.pause) {
      await wasmBoy.pause()
      status.value = 'paused'
    }
  }

  async function resume() {
    if (!wasmBoy) {
      return
    }

    await play()
  }

  async function reset() {
    if (wasmBoy?.reset) {
      await wasmBoy.reset()
      // reset() internally calls loadROM() which re-enables the default joypad.
      wasmBoy.disableDefaultJoypad?.()
      syncAudioMuteState()
      status.value = 'loaded'
    }
  }

  function getAudioChannels() {
    return wasmBoy?._getAudioChannels?.() ?? null
  }

  function syncAudioMuteState() {
    const channels = getAudioChannels()
    if (!channels) {
      return
    }

    if (isMuted.value) {
      channels.master?.mute?.()
      channels.channel1?.mute?.()
      channels.channel2?.mute?.()
      channels.channel3?.mute?.()
      channels.channel4?.mute?.()
      return
    }

    channels.channel1?._libUnmute?.()
    channels.channel1?.unmute?.()
    channels.channel2?._libUnmute?.()
    channels.channel2?.unmute?.()
    channels.channel3?._libUnmute?.()
    channels.channel3?.unmute?.()
    channels.channel4?._libUnmute?.()
    channels.channel4?.unmute?.()
    channels.master?.unmute?.()
  }

  function toggleMute() {
    if (!wasmBoy) {
      return
    }

    isMuted.value = !isMuted.value
    syncAudioMuteState()
  }

  function setJoypadState(joypadState) {
    wasmBoy?.setJoypadState?.(mapJoypadState(joypadState))
  }

  async function saveState() {
    if (!canSaveStates.value || !wasmBoy) {
      throw new Error('Save states are unavailable.')
    }

    const snapshot = await wasmBoy.saveState()
    if (!currentRomId) {
      return snapshot
    }

    const id = `${currentRomId}-latest`
    await cartdeckDb.saves.put({
      id,
      romId: currentRomId,
      label: 'Latest Save',
      data: snapshot,
      createdAt: new Date().toISOString(),
    })

    return snapshot
  }

  async function loadState() {
    if (!canSaveStates.value || !wasmBoy || !currentRomId) {
      throw new Error('No save state is available.')
    }

    const snapshot = await cartdeckDb.saves.get(`${currentRomId}-latest`)
    if (!snapshot) {
      throw new Error('No save state is available for this cartridge yet.')
    }

    await wasmBoy.loadState(snapshot.data)
    syncAudioMuteState()
    await wasmBoy.play?.()
    status.value = 'playing'
    return snapshot
  }

  async function destroy() {
    const destroyToken = ++lifecycleToken
    const activeWasmBoy = wasmBoy

    try {
      if (activeWasmBoy?.pause) {
        await activeWasmBoy.pause()
      }
    } catch (caughtError) {
      console.warn('Unable to pause emulator during cleanup:', caughtError)
    }

    if (destroyToken !== lifecycleToken) {
      return
    }

    wasmBoy = null
    resetState()
  }

  return {
    status,
    error,
    canSaveStates,
    isMuted,
    init,
    loadRom,
    play,
    pause,
    resume,
    reset,
    saveState,
    loadState,
    destroy,
    setJoypadState,
    toggleMute,
  }
}
