<script setup>
import { RouterLink } from 'vue-router'

import { useSettings } from '@/composables/useSettings'
import logo from '@/assets/images/logo.png'

const settings = useSettings()
</script>

<template>
  <header class="sticky top-0 z-40 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/15 bg-white/10 px-5 py-4 shadow-[0_18px_45px_rgba(1,8,20,0.28)] backdrop-blur-2xl">
      <RouterLink to="/library" class="inline-flex items-center">
        <img :src="logo" alt="CartDeck" class="h-11 w-auto object-contain sm:h-12" />
      </RouterLink>
      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[var(--text-primary)] shadow-[0_10px_28px_rgba(1,8,20,0.18)] backdrop-blur-xl transition hover:bg-white/18 focus:outline-none focus:ring-4 focus:ring-sky-300/20"
        aria-label="Open settings"
        @click="settings.openSettings()"
      >
        <FontAwesomeIcon icon="fa-solid fa-gear" class="text-base" />
      </button>
    </div>
  </header>
</template>
