import { ref } from 'vue'

const toasts = ref([])
const toastTimers = new Map()

export function useToasts() {
  function addToast(message, tone = 'info', timeout = 3200) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    toasts.value.push({ id, message, tone })

    if (timeout > 0 && typeof window !== 'undefined') {
      const timerId = window.setTimeout(() => {
        toastTimers.delete(id)
        removeToast(id)
      }, timeout)
      toastTimers.set(id, timerId)
    }

    return id
  }

  function removeToast(id) {
    const timerId = toastTimers.get(id)
    if (timerId && typeof window !== 'undefined') {
      window.clearTimeout(timerId)
      toastTimers.delete(id)
    }

    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast,
  }
}
