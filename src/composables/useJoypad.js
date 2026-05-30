import { reactive } from 'vue'

const joypadState = reactive({
  up: false,
  right: false,
  down: false,
  left: false,
  a: false,
  b: false,
  start: false,
  select: false,
})

export function useJoypad() {
  function setButtonPressed(key, pressed) {
    if (!(key in joypadState)) {
      return
    }

    const nextPressed = Boolean(pressed)
    if (joypadState[key] === nextPressed) {
      return
    }

    joypadState[key] = nextPressed
  }

  function pressButton(key) {
    setButtonPressed(key, true)
  }

  function releaseButton(key) {
    setButtonPressed(key, false)
  }

  function setJoypadState(nextState) {
    Object.keys(joypadState).forEach((key) => {
      joypadState[key] = Boolean(nextState[key])
    })
  }

  function resetJoypadState() {
    setJoypadState({
      up: false,
      right: false,
      down: false,
      left: false,
      a: false,
      b: false,
      start: false,
      select: false,
    })
  }

  return {
    joypadState,
    setButtonPressed,
    pressButton,
    releaseButton,
    setJoypadState,
    resetJoypadState,
  }
}
