const CODE_TO_BUTTON = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  KeyZ: 'a',
  KeyX: 'b',
  Enter: 'start',
  ShiftLeft: 'select',
  ShiftRight: 'select',
}

export function useKeyboardControls(joypad) {
  const activeCodes = new Set()

  function releaseAllActiveKeys() {
    activeCodes.forEach((code) => {
      const button = CODE_TO_BUTTON[code]
      if (button) {
        joypad.setButtonPressed(button, false)
      }
    })
    activeCodes.clear()
  }

  function handleKeyDown(event) {
    const button = CODE_TO_BUTTON[event.code]

    if (!button || activeCodes.has(event.code)) {
      return
    }

    event.preventDefault()
    activeCodes.add(event.code)
    joypad.setButtonPressed(button, true)
  }

  function handleKeyUp(event) {
    const button = CODE_TO_BUTTON[event.code]

    if (!button) {
      return
    }

    event.preventDefault()
    activeCodes.delete(event.code)
    joypad.setButtonPressed(button, false)
  }

  function bind() {
    releaseAllActiveKeys()
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', releaseAllActiveKeys)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  function unbind() {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', releaseAllActiveKeys)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    releaseAllActiveKeys()
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      releaseAllActiveKeys()
    }
  }

  return {
    bind,
    unbind,
  }
}
