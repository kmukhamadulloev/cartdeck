<script setup>
import { computed, ref } from 'vue'

import ConfirmModal from '@/components/ConfirmModal.vue'
import SettingsSelect from '@/components/SettingsSelect.vue'
import { usePersistentStorage } from '@/composables/usePersistentStorage'
import { useRomLibrary } from '@/composables/useRomLibrary'
import { useSettings } from '@/composables/useSettings'
import { useToasts } from '@/composables/useToasts'
import { validateBackgroundImageFile } from '@/utils/fileValidation'

const settings = useSettings()
const storage = usePersistentStorage()
const library = useRomLibrary()
const toasts = useToasts()
const confirmAction = ref('')
const isDarkTheme = computed(() => settings.selectedTheme.value === 'dark')
const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
]
const backgroundOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Pixel Grid', value: 'pixel-grid' },
  { label: 'Neon Dungeon', value: 'neon-dungeon' },
  { label: 'Green LCD', value: 'green-lcd' },
  { label: 'Dark Arcade', value: 'dark-arcade' },
]
const animationOptions = [
  { label: 'Full', value: 'full' },
  { label: 'Reduced', value: 'reduced' },
]

const panelClass = computed(() =>
  isDarkTheme.value
    ? 'border-white/10 bg-slate-950/88 text-slate-50'
    : 'border-slate-200/90 bg-white/96 text-slate-900',
)

const sectionClass = computed(() => (isDarkTheme.value ? 'border-white/8' : 'border-slate-200/80'))

const fieldClass = computed(() =>
  isDarkTheme.value
    ? 'border-white/10 bg-white/[0.04] text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
    : 'border-slate-200 bg-white text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
)

const fieldLabelClass = computed(() => (isDarkTheme.value ? 'text-slate-400' : 'text-slate-500'))

const supportingTextClass = computed(() =>
  isDarkTheme.value ? 'text-slate-400' : 'text-slate-500',
)

const actionButtonClass = computed(() =>
  isDarkTheme.value
    ? 'rounded-full border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]'
    : 'rounded-full border-slate-200 bg-white text-slate-800 hover:bg-slate-100',
)

const dangerButtonClass = computed(() =>
  isDarkTheme.value
    ? 'rounded-2xl border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/18'
    : 'rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
)

function openConfirm(action) {
  confirmAction.value = action
}

function closeConfirm() {
  confirmAction.value = ''
}

async function handleBackgroundChange(event) {
  const [file] = event.target.files || []
  if (!file) {
    return
  }

  const validation = validateBackgroundImageFile(file)
  if (!validation.ok) {
    toasts.addToast(validation.error, 'error')
    return
  }

  await settings.setCustomBackgroundBlob(file)
  await settings.setBackgroundKey('default')
  toasts.addToast('Custom background stored locally.', 'success')
}

async function confirm() {
  if (confirmAction.value === 'delete-roms') {
    await library.deleteAllRoms()
    await settings.setLatestRomId(null)
    toasts.addToast('All cartridges were removed from local storage.', 'success')
  }

  if (confirmAction.value === 'clear-data') {
    await settings.clearAllLocalData()
    await library.loadRoms()
    toasts.addToast('All local CartDeck data was cleared.', 'success')
  }

  closeConfirm()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="pixel-pop">
      <aside
        v-if="settings.isSettingsOpen.value"
        class="fixed inset-0 z-50 grid justify-items-end bg-slate-950/45"
        @click.self="settings.closeSettings()"
      >
        <div
          class="h-full w-full max-w-md overflow-auto border-l p-6 shadow-[0_18px_45px_rgba(1,8,20,0.32)] backdrop-blur-2xl"
          :class="panelClass"
        >
          <div class="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 class="m-0 text-2xl font-semibold tracking-tight">Settings</h2>
            </div>
            <button
              type="button"
              class="inline-flex h-11 w-11 items-center justify-center border transition"
              :class="actionButtonClass"
              aria-label="Close settings"
              @click="settings.closeSettings()"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" class="text-lg" />
            </button>
          </div>

          <div class="grid gap-5">
            <section>
              <div
                class="px-1 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]"
                :class="fieldLabelClass"
              >
                Appearance
              </div>
              <div
                class="border"
                :class="[sectionClass, isDarkTheme ? 'bg-white/[0.02]' : 'bg-white']"
              >
                <div
                  class="border-b p-0"
                  :class="isDarkTheme ? 'border-b-white/10' : 'border-b-slate-200'"
                >
                  <SettingsSelect
                    label="Theme"
                    :dark="isDarkTheme"
                    :model-value="settings.selectedTheme.value"
                    :options="themeOptions"
                    @update:model-value="settings.setTheme"
                  />
                </div>
                <SettingsSelect
                  label="Background"
                  :dark="isDarkTheme"
                  :model-value="settings.selectedBackgroundKey.value"
                  :options="backgroundOptions"
                  @update:model-value="settings.setBackgroundKey"
                />
              </div>
            </section>

            <section>
              <div
                class="px-1 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]"
                :class="fieldLabelClass"
              >
                Wallpaper
              </div>
              <div
                class="overflow-hidden border"
                :class="[sectionClass, isDarkTheme ? 'bg-white/[0.02]' : 'bg-white']"
              >
                <div class="px-4 py-4" :class="fieldClass">
                  <div class="mb-2 text-sm font-medium">Upload custom background</div>
                  <input
                    class="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:px-4 file:py-2 file:font-medium"
                    :class="supportingTextClass"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    @change="handleBackgroundChange"
                  />
                </div>
                <div
                  class="border-t px-4 py-4"
                  :class="isDarkTheme ? 'border-t-white/10' : 'border-t-slate-200'"
                >
                  <button
                    type="button"
                    class="w-full border px-4 py-3 text-sm font-medium transition"
                    :class="actionButtonClass"
                    @click="settings.setCustomBackgroundBlob(null)"
                  >
                    Remove custom background
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div
                class="px-1 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]"
                :class="fieldLabelClass"
              >
                Motion
              </div>
              <div
                class="border"
                :class="[sectionClass, isDarkTheme ? 'bg-white/[0.02]' : 'bg-white']"
              >
                <SettingsSelect
                  label="Animation"
                  :dark="isDarkTheme"
                  :model-value="settings.animationMode.value"
                  :options="animationOptions"
                  @update:model-value="settings.setAnimationMode"
                />
              </div>
            </section>

            <section>
              <div
                class="px-1 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]"
                :class="fieldLabelClass"
              >
                Storage
              </div>
              <div
                class="overflow-hidden border"
                :class="[sectionClass, isDarkTheme ? 'bg-white/[0.02]' : 'bg-white']"
              >
                <div
                  class="border-b px-4 py-4 text-sm"
                  :class="[
                    fieldClass,
                    supportingTextClass,
                    isDarkTheme ? 'border-b-white/10' : 'border-b-slate-200',
                  ]"
                >
                  Persistent: {{ storage.persisted.value ? 'Granted' : 'Not granted' }}
                </div>
                <div
                  class="border-b px-4 py-4 text-sm"
                  :class="[
                    fieldClass,
                    supportingTextClass,
                    isDarkTheme ? 'border-b-white/10' : 'border-b-slate-200',
                  ]"
                >
                  Usage: {{ storage.estimate.value.usageText }} /
                  {{ storage.estimate.value.quotaText }}
                </div>
                <div class="grid gap-3 px-4 py-4">
                  <button
                    type="button"
                    class="w-full border px-4 py-3 text-sm font-medium transition"
                    :class="actionButtonClass"
                    @click="storage.refresh()"
                  >
                    Refresh storage status
                  </button>
                  <button
                    type="button"
                    class="w-full border px-4 py-3 text-sm font-medium transition"
                    :class="actionButtonClass"
                    @click="storage.requestPersistence()"
                  >
                    Request persistent storage
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div
                class="px-1 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]"
                :class="fieldLabelClass"
              >
                Local data
              </div>
              <div
                class="overflow-hidden border"
                :class="[sectionClass, isDarkTheme ? 'bg-white/[0.02]' : 'bg-white']"
              >
                <div class="grid gap-3 px-4 py-4">
                  <button
                    type="button"
                    class="w-full border px-4 py-3 text-sm font-medium transition"
                    :class="dangerButtonClass"
                    @click="openConfirm('delete-roms')"
                  >
                    Delete all ROMs
                  </button>
                  <button
                    type="button"
                    class="w-full border px-4 py-3 text-sm font-medium transition"
                    :class="dangerButtonClass"
                    @click="openConfirm('clear-data')"
                  >
                    Clear all local data
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>

  <ConfirmModal
    v-if="confirmAction"
    :title="confirmAction === 'delete-roms' ? 'Delete All ROMs?' : 'Clear All Local Data?'"
    :message="
      confirmAction === 'delete-roms'
        ? 'This removes every cartridge and app-managed save from local storage.'
        : 'This clears cartridges, settings, backgrounds, and app-managed saves from this browser.'
    "
    @close="closeConfirm"
    @confirm="confirm"
  />
</template>
