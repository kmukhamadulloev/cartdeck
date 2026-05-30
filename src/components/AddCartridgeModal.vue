<script setup>
import { computed, ref } from 'vue'

import ModalBase from '@/components/ModalBase.vue'
import PixelButton from '@/components/PixelButton.vue'
import { useRomLibrary } from '@/composables/useRomLibrary'
import { useToasts } from '@/composables/useToasts'
import { validateCoverImageFile, validateRomFile } from '@/utils/fileValidation'
import { cleanFilename, readRomTitle } from '@/utils/romUtils'

const emit = defineEmits(['close', 'saved'])

const library = useRomLibrary()
const toasts = useToasts()

const step = ref(1)
const legalAccepted = ref(false)
const romInput = ref(null)
const romFile = ref(null)
const romBytes = ref(null)
const coverImageFile = ref(null)
const customTitle = ref('')
const error = ref('')
const isSaving = ref(false)

const previewTitle = computed(() => customTitle.value || (romFile.value ? cleanFilename(romFile.value.name) : 'New Cartridge'))

async function handleRomChange(event) {
  const [file] = event.target.files || []
  if (!file) {
    return
  }

  const validation = validateRomFile(file)
  if (!validation.ok) {
    error.value = validation.error
    return
  }

  const buffer = await file.arrayBuffer()
  romBytes.value = new Uint8Array(buffer)
  romFile.value = file
  customTitle.value = readRomTitle(romBytes.value) || cleanFilename(file.name)
  step.value = 2
  error.value = ''
}

function resetRomInput() {
  if (romInput.value) {
    romInput.value.value = ''
  }
}

function handleCoverChange(event) {
  const [file] = event.target.files || []
  if (!file) {
    return
  }

  const validation = validateCoverImageFile(file)
  if (!validation.ok) {
    error.value = validation.error
    return
  }

  coverImageFile.value = file
  error.value = ''
}

async function saveCartridge() {
  if (!romFile.value || !romBytes.value) {
    error.value = 'Import a ROM before saving this cartridge.'
    return
  }

  isSaving.value = true

  try {
    const record = await library.addRom({
      romFile: romFile.value,
      romBytes: romBytes.value,
      customTitle: customTitle.value,
      coverImageFile: coverImageFile.value,
    })

    if (record.wasDuplicate) {
      toasts.addToast('That cartridge is already in your library. Existing local data was kept.', 'info')
    } else {
      toasts.addToast('Cartridge saved locally.', 'success')
    }
    emit('saved', record)
  } catch (caughtError) {
    console.error('Unable to save cartridge:', caughtError)
    error.value = caughtError.message || 'This cartridge could not be saved locally.'
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  step.value = 1
  resetRomInput()
}
</script>

<template>
  <ModalBase @close="emit('close')">
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Add Cartridge</h2>
        <p class="section-copy">
          Select a `.gb` or `.gbc` file from your device. CartDeck does not provide games and does not upload your files to any server.
        </p>
      </div>
    </div>

    <div class="modal-body">
      <div v-if="step === 1" class="cartridge-form">
        <label class="field-inline">
          <input v-model="legalAccepted" type="checkbox" />
          <span>
            I confirm that I have the legal right to use this ROM file, and I understand that CartDeck does not provide or distribute games.
          </span>
        </label>
        <input
          ref="romInput"
          :disabled="!legalAccepted"
          type="file"
          accept=".gb,.gbc"
          @change="handleRomChange"
        />
      </div>

      <div v-else class="cartridge-form">
        <div class="status-note">ROM imported locally. It has not been uploaded anywhere.</div>
        <div class="cartridge-cover">
          <div class="cartridge-cover__fallback">{{ previewTitle }}</div>
        </div>
        <div class="field-group">
          <label for="customTitle">Cartridge Title</label>
          <input id="customTitle" v-model="customTitle" type="text" maxlength="80" />
        </div>
        <div class="field-group">
          <label for="coverImage">Cartridge Image</label>
          <input id="coverImage" type="file" accept=".png,.jpg,.jpeg,.webp" @change="handleCoverChange" />
        </div>
      </div>

      <p v-if="error" class="field-error">{{ error }}</p>
    </div>

    <div class="modal-actions">
      <PixelButton variant="ghost" @click="emit('close')">Cancel</PixelButton>
      <PixelButton v-if="step === 2" variant="secondary" @click="goBack">Back</PixelButton>
      <PixelButton v-if="step === 2" :disabled="isSaving" @click="saveCartridge">Save Cartridge</PixelButton>
    </div>
  </ModalBase>
</template>
