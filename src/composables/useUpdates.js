import { ref } from 'vue'

const updates = ref([])
const isLoading = ref(false)
const error = ref('')
let activeController = null

export function useUpdates() {
  async function refresh() {
    if (typeof window === 'undefined') {
      updates.value = []
      isLoading.value = false
      return updates.value
    }

    activeController?.abort()
    activeController = new AbortController()

    isLoading.value = true
    error.value = ''

    const timeoutId = window.setTimeout(() => {
      activeController?.abort()
    }, 5000)

    try {
      const response = await fetch('https://cartdeck.stacknstress.com/news/updates.json', {
        signal: activeController.signal,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = await response.json()
      updates.value = Array.isArray(payload?.updates) ? payload.updates : []
    } catch (caughtError) {
      error.value = 'Latest updates are unavailable right now, but the rest of CartDeck is ready to use.'
      updates.value = []
      console.warn('Unable to load updates:', caughtError)
    } finally {
      window.clearTimeout(timeoutId)
      isLoading.value = false
      activeController = null
    }
  }

  return {
    updates,
    isLoading,
    error,
    refresh,
  }
}
