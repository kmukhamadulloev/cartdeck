<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AddCartridgeModal from '@/components/AddCartridgeModal.vue'
import CartridgeGrid from '@/components/CartridgeGrid.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import EditCartridgeModal from '@/components/EditCartridgeModal.vue'
import { useRomLibrary } from '@/composables/useRomLibrary'
import { useSettings } from '@/composables/useSettings'
import { useToasts } from '@/composables/useToasts'
import { useUpdates } from '@/composables/useUpdates'

const library = useRomLibrary()
const settings = useSettings()
const router = useRouter()
const toasts = useToasts()
const updatesFeed = useUpdates()

const isAddOpen = ref(false)
const romToEdit = ref(null)
const romToDelete = ref(null)

onMounted(async () => {
  try {
    await Promise.all([library.loadRoms(), updatesFeed.refresh()])
  } catch (caughtError) {
    console.error('Unable to initialize the library view:', caughtError)
    toasts.addToast('Some library data could not be loaded right now.', 'error')
  }
})

async function handleInsert(rom) {
  await settings.setLatestRomId(rom.id)
  await library.updateLastPlayed(rom.id)
  await router.push('/emu')
}

async function confirmDelete() {
  if (!romToDelete.value) {
    return
  }

  await library.deleteRom(romToDelete.value.id)

  if (settings.latestRomId.value === romToDelete.value.id) {
    await settings.setLatestRomId(null)
  }

  toasts.addToast('Cartridge deleted from local storage.', 'success')
  romToDelete.value = null
}

async function handleAddSaved() {
  isAddOpen.value = false

  try {
    await library.loadRoms()
  } catch (caughtError) {
    console.error('Unable to refresh the library after adding a cartridge:', caughtError)
    toasts.addToast('The library could not be refreshed after saving.', 'error')
  }
}

async function handleEditSaved() {
  romToEdit.value = null

  try {
    await library.loadRoms()
  } catch (caughtError) {
    console.error('Unable to refresh the library after editing a cartridge:', caughtError)
    toasts.addToast('The library could not be refreshed after saving changes.', 'error')
  }
}

async function handleEditUpdated(record) {
  romToEdit.value = record

  try {
    await library.loadRoms()
  } catch (caughtError) {
    console.error('Unable to refresh the library after updating a cartridge cover:', caughtError)
    toasts.addToast('The library could not be refreshed after removing the cover.', 'error')
  }
}
</script>

<template>
  <div class="page space-y-6">
    <section
      v-if="updatesFeed.updates.value.length && !updatesFeed.error.value"
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="item in updatesFeed.updates.value.slice(0, 3)"
        :key="item.id"
        class="group relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/14 bg-white/8 p-5 shadow-[0_20px_50px_rgba(2,8,20,0.24)] backdrop-blur-2xl"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(115,224,255,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))]" />
        <div class="relative flex h-full flex-col justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">News</p>
            <h2 class="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {{ item.title }}
            </h2>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium text-white/60">{{ item.date }}</p>
            <p class="line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{{ item.body }}</p>
            <a
              v-if="item.url"
              class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition hover:text-white"
              :href="item.url"
              target="_blank"
              rel="noreferrer"
            >
              Read update
            </a>
          </div>
        </div>
      </article>
    </section>

    <section class="space-y-5">
      <CartridgeGrid
        :roms="library.roms.value"
        @add="isAddOpen = true"
        @insert="handleInsert"
        @edit="romToEdit = $event"
        @delete="romToDelete = $event"
      />
      <div v-if="!library.roms.value.length" class="empty-state">
        No cartridges imported yet. Start by adding a legally owned ROM from your device.
      </div>
    </section>

    <AddCartridgeModal
      v-if="isAddOpen"
      @close="isAddOpen = false"
      @saved="handleAddSaved"
    />

    <EditCartridgeModal
      v-if="romToEdit"
      :rom="romToEdit"
      @close="romToEdit = null"
      @saved="handleEditSaved"
      @updated="handleEditUpdated"
    />

    <ConfirmModal
      v-if="romToDelete"
      title="Delete Cartridge?"
      message="This removes the ROM, custom cover image, and app-managed save data from local storage."
      confirm-label="Delete Cartridge"
      @close="romToDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
