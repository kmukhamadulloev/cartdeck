<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import GameCanvas from '@/components/GameCanvas.vue'

const props = defineProps({
  hasRom: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'idle',
  },
  canSaveStates: {
    type: Boolean,
    default: false,
  },
  joypadState: {
    type: Object,
    default: () => ({
      up: false,
      right: false,
      down: false,
      left: false,
      a: false,
      b: false,
      start: false,
      select: false,
    }),
  },
})

const emit = defineEmits(['add-cartridge', 'open-library', 'set-button'])

const gameCanvas = ref(null)
const dPad = ref(null)
const activePointers = new Map()

defineExpose({
  gameCanvas,
})

function handlePress(button) {
  emit('set-button', button, true)
}

function handleRelease(button) {
  emit('set-button', button, false)
}

function handleDPadPointerDown(event) {
  event.preventDefault()
  event.currentTarget.setPointerCapture?.(event.pointerId)
  const nextButton = resolveDPadDirection(event)
  if (!nextButton) {
    return
  }

  const previousButton = activePointers.get(event.pointerId)
  if (previousButton && previousButton !== nextButton) {
    handleRelease(previousButton)
  }

  activePointers.set(event.pointerId, nextButton)
  handlePress(nextButton)
}

function resolveDPadDirection(event) {
  const rect = dPad.value?.getBoundingClientRect?.()
  if (!rect) {
    return null
  }

  const relativeX = (event.clientX - rect.left) / rect.width - 0.5
  const relativeY = (event.clientY - rect.top) / rect.height - 0.5
  const absX = Math.abs(relativeX)
  const absY = Math.abs(relativeY)

  if (absY > absX) {
    return relativeY < 0 ? 'up' : 'down'
  }

  return relativeX < 0 ? 'left' : 'right'
}

function handlePointerMove(event) {
  const currentButton = activePointers.get(event.pointerId)
  if (!currentButton) {
    return
  }

  const hoveredButton = resolveDPadDirection(event)
  if (hoveredButton === currentButton) {
    return
  }

  handleRelease(currentButton)

  if (!hoveredButton) {
    activePointers.delete(event.pointerId)
    return
  }

  activePointers.set(event.pointerId, hoveredButton)
  handlePress(hoveredButton)
}

function releasePointer(event) {
  const button = activePointers.get(event.pointerId)
  if (!button) {
    return
  }

  activePointers.delete(event.pointerId)
  handleRelease(button)
}

function handlePointerEnd(event) {
  event.preventDefault()
  releasePointer(event)
}

function handleActionPointerDown(event, button) {
  event.preventDefault()
  event.currentTarget.setPointerCapture?.(event.pointerId)
  const previousButton = activePointers.get(event.pointerId)
  if (previousButton && previousButton !== button) {
    handleRelease(previousButton)
  }
  activePointers.set(event.pointerId, button)
  handlePress(button)
}

function buttonClass(baseClass, button) {
  return [baseClass, { 'is-pressed': props.joypadState[button] }]
}

function preventBrowserGesture(event) {
  event.preventDefault()
}

function releaseAllPointers() {
  activePointers.forEach((button) => {
    handleRelease(button)
  })
  activePointers.clear()
}

function handleVisibilityChange() {
  if (document.hidden) {
    releaseAllPointers()
  }
}

onMounted(() => {
  window.addEventListener('blur', releaseAllPointers)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('blur', releaseAllPointers)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  releaseAllPointers()
})
</script>

<template>
  <div class="container">
    <div
      class="console"
      @contextmenu="preventBrowserGesture"
      @dragstart="preventBrowserGesture"
      @selectstart="preventBrowserGesture"
    >
      <div class="connection">▲ Comm</div>
      <div class="screen">
        <div class="lcd">
          <GameCanvas v-if="props.hasRom" ref="gameCanvas" />
          <div v-else class="no-game-screen">
            <div class="no-game-screen__title">NO GAME LOADED</div>
            <div class="no-game-screen__sub">
              Import a cartridge to play locally in this browser.
            </div>
            <div class="button-row">
              <button class="lcd-action" type="button" @click="emit('add-cartridge')">
                Add Cartridge
              </button>
              <button class="lcd-action" type="button" @click="emit('open-library')">
                Open Library
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="brand">CartDeck</div>

      <div class="buttons-row">
        <div class="left">
          <div
            ref="dPad"
            class="d-pad"
            @pointerdown="handleDPadPointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerEnd"
            @pointercancel="handlePointerEnd"
            @lostpointercapture="handlePointerEnd"
          >
            <button
              :class="buttonClass('line', 'up')"
              aria-label="Up"
              data-control-button="up"
              type="button"
            >
              ⭡
            </button>
            <button
              :class="buttonClass('line', 'right')"
              aria-label="Right"
              data-control-button="right"
              type="button"
            >
              →
            </button>
            <button
              :class="buttonClass('line', 'down')"
              aria-label="Down"
              data-control-button="down"
              type="button"
            >
              ↓
            </button>
            <button
              :class="buttonClass('line', 'left')"
              aria-label="Left"
              data-control-button="left"
              type="button"
            >
              ←
            </button>
            <div class="middle" />
          </div>
        </div>

        <div class="right">
            <button
              :class="{ 'is-pressed': props.joypadState.a }"
              aria-label="A"
              type="button"
              @pointerdown="handleActionPointerDown($event, 'a')"
              @pointerup="handlePointerEnd"
              @pointercancel="handlePointerEnd"
              @lostpointercapture="handlePointerEnd"
            >
              A
            </button>
            <button
              :class="{ 'is-pressed': props.joypadState.b }"
              aria-label="B"
              type="button"
              @pointerdown="handleActionPointerDown($event, 'b')"
              @pointerup="handlePointerEnd"
              @pointercancel="handlePointerEnd"
              @lostpointercapture="handlePointerEnd"
            >
              B
            </button>
        </div>
      </div>

      <div class="small-buttons">
        <button
          :class="{ 'is-pressed': props.joypadState.start }"
          aria-label="Start"
          type="button"
          @pointerdown="handleActionPointerDown($event, 'start')"
          @pointerup="handlePointerEnd"
          @pointercancel="handlePointerEnd"
          @lostpointercapture="handlePointerEnd"
        >
          <span>Start</span>
        </button>
        <button
          :class="{ 'is-pressed': props.joypadState.select }"
          aria-label="Select"
          type="button"
          @pointerdown="handleActionPointerDown($event, 'select')"
          @pointerup="handlePointerEnd"
          @pointercancel="handlePointerEnd"
          @lostpointercapture="handlePointerEnd"
        >
          <span>Select</span>
        </button>
      </div>

      <div class="sound-grid">
        <div class="band" />
        <div class="band" />
        <div class="band" />
        <div class="band" />
        <div class="band" />
        <div class="band" />
      </div>
    </div>
  </div>
</template>
