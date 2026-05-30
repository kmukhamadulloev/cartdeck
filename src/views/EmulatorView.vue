<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AddCartridgeModal from '@/components/AddCartridgeModal.vue'
import GameConsole from '@/components/GameConsole.vue'
import { useEmulator } from '@/composables/useEmulator'
import { useJoypad } from '@/composables/useJoypad'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { useRomLibrary } from '@/composables/useRomLibrary'
import { useSettings } from '@/composables/useSettings'
import { useToasts } from '@/composables/useToasts'

const library = useRomLibrary()
const settings = useSettings()
const emulator = useEmulator()
const joypad = useJoypad()
const toasts = useToasts()
const router = useRouter()

const consoleRef = ref(null)
const latestRom = ref(null)
const showAddModal = ref(false)

const keyboard = useKeyboardControls(joypad)

watch(
  () => ({ ...joypad.joypadState }),
  (state) => {
    emulator.setJoypadState(state)
  },
  { deep: true, immediate: true },
)

async function loadLatestRom() {
  await settings.ensureLoaded()
  await library.loadRoms()
  latestRom.value = await library.getLatestRom(settings.latestRomId.value)

  if (!latestRom.value) {
    return
  }

  await nextTick()
  const gameCanvasComponent = consoleRef.value?.gameCanvas
  const canvas = gameCanvasComponent?.canvas || gameCanvasComponent?.$el?.querySelector?.('canvas')
  if (!canvas) {
    toasts.addToast('The emulator screen could not be attached to a canvas element.', 'error')
    return
  }

  const initialized = await emulator.init(canvas)
  if (!initialized) {
    return
  }

  const loaded = await emulator.loadRom(latestRom.value)
  if (loaded) {
    try {
      await emulator.play()
    } catch (caughtError) {
      console.warn('Autoplay was blocked or failed:', caughtError)
      toasts.addToast('Cartridge loaded. Press Play if the browser blocked autoplay.', 'info')
    }

    await library.updateLastPlayed(latestRom.value.id)
  }
}

function setButton(button, pressed) {
  joypad.setButtonPressed(button, pressed)
}

async function saveState() {
  try {
    await emulator.saveState()
    toasts.addToast('Save state stored locally.', 'success')
  } catch (caughtError) {
    toasts.addToast(caughtError.message, 'error')
  }
}

async function loadState() {
  try {
    await emulator.loadState()
    toasts.addToast('Save state restored.', 'success')
  } catch (caughtError) {
    toasts.addToast(caughtError.message, 'error')
  }
}

async function handleSavedCartridge() {
  showAddModal.value = false
  await loadLatestRom()
}

onMounted(async () => {
  keyboard.bind()

  try {
    await loadLatestRom()
  } catch (caughtError) {
    console.error('Unable to initialize the emulator view:', caughtError)
    keyboard.unbind()
    toasts.addToast('The emulator could not finish loading this cartridge.', 'error')
  }
})

onBeforeUnmount(async () => {
  keyboard.unbind()
  await emulator.destroy()
})
</script>

<template>
  <div class="emu-layout">
    <div class="emu-toolbar">
      <button class="icon-button" type="button" @click="router.push('/library')" aria-label="Back to library">
        <FontAwesomeIcon icon="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="emu-toolbar__group">
        <button
          class="icon-button"
          type="button"
          :aria-label="emulator.status.value === 'playing' ? 'Pause emulator' : 'Play emulator'"
          @click="emulator.status.value === 'playing' ? emulator.pause() : emulator.play()"
        >
          <FontAwesomeIcon
            :icon="emulator.status.value === 'playing' ? 'fa-solid fa-pause' : 'fa-solid fa-play'"
            aria-hidden="true"
          />
        </button>
        <button class="icon-button" type="button" @click="emulator.reset()" aria-label="Reset emulator">
          <FontAwesomeIcon icon="fa-solid fa-arrows-rotate" aria-hidden="true" />
        </button>
        <button
          class="icon-button"
          type="button"
          :aria-label="emulator.isMuted.value ? 'Turn sound on' : 'Turn sound off'"
          @click="emulator.toggleMute()"
        >
          <FontAwesomeIcon
            :icon="emulator.isMuted.value ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"
            aria-hidden="true"
          />
        </button>
        <button
          class="icon-button"
          type="button"
          :disabled="!emulator.canSaveStates.value"
          @click="saveState"
          aria-label="Save state"
        >
          <FontAwesomeIcon icon="fa-solid fa-floppy-disk" aria-hidden="true" />
        </button>
        <button
          class="icon-button"
          type="button"
          :disabled="!emulator.canSaveStates.value"
          @click="loadState"
          aria-label="Load state"
        >
          <FontAwesomeIcon icon="fa-solid fa-upload" aria-hidden="true" />
        </button>
      </div>
    </div>

    <GameConsole
      ref="consoleRef"
      :has-rom="Boolean(latestRom)"
      :status="emulator.status.value"
      :can-save-states="emulator.canSaveStates.value"
      :joypad-state="joypad.joypadState"
      @add-cartridge="showAddModal = true"
      @open-library="router.push('/library')"
      @set-button="setButton"
    />

    <div v-if="emulator.error.value" class="status-note emu-status-note">{{ emulator.error.value }}</div>

    <AddCartridgeModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @saved="handleSavedCartridge"
    />
  </div>
</template>
