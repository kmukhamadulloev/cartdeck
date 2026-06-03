<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import SettingsDrawer from '@/components/SettingsDrawer.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import { useBackground } from '@/composables/useBackground'
import { useSettings } from '@/composables/useSettings'
import { useToasts } from '@/composables/useToasts'

const settings = useSettings()
const background = useBackground()
const toasts = useToasts()
const route = useRoute()
const prefersDark = ref(
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true,
)

function syncPreferredTheme(event) {
  prefersDark.value = event.matches
}

const resolvedTheme = computed(() => {
  const selected = settings.selectedTheme.value
  if (selected === 'light' || selected === 'dark') {
    return `theme-${selected}`
  }

  return prefersDark.value ? 'theme-dark' : 'theme-light'
})

const appClasses = computed(() => [
  'app-shell',
  resolvedTheme.value,
  `console-theme-${settings.consoleTheme.value}`,
  `animation-${settings.animationMode.value}`,
  background.backgroundClass.value,
  { 'app-shell--emu': route.name === 'emulator' },
])

const isEmulatorRoute = computed(() => route.name === 'emulator')

onMounted(() => {
  settings.ensureLoaded()
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  syncPreferredTheme(media)
  media.addEventListener('change', syncPreferredTheme)
})

onUnmounted(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.removeEventListener('change', syncPreferredTheme)
})
</script>

<template>
  <div :class="appClasses" :style="background.backgroundStyle.value">
    <div class="app-shell__overlay" />
    <div class="background-orbs" aria-hidden="true">
      <span class="background-orb background-orb--one" />
      <span class="background-orb background-orb--two" />
      <span class="background-orb background-orb--three" />
    </div>
    <div class="app-shell__inner">
      <AppHeader v-if="!isEmulatorRoute" />
      <main class="app-main" :class="{ 'app-main--emu': isEmulatorRoute }">
        <RouterView v-slot="{ Component, route }">
          <Transition name="route-fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <SettingsDrawer />
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <ToastMessage
        v-for="toast in toasts.toasts.value"
        :key="toast.id"
        :toast="toast"
        @close="toasts.removeToast(toast.id)"
      />
    </div>
  </div>
</template>
