<script setup>
import { ref } from 'vue'

import ModalBase from '@/components/ModalBase.vue'
import PixelButton from '@/components/PixelButton.vue'
import { useRomLibrary } from '@/composables/useRomLibrary'
import { useToasts } from '@/composables/useToasts'
import { validateCoverImageFile } from '@/utils/fileValidation'

const props = defineProps({
  rom: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'saved', 'updated'])

const library = useRomLibrary()
const toasts = useToasts()

const customTitle = ref(props.rom.customTitle || props.rom.title || '')
const coverImageBlob = ref(props.rom.coverImageBlob || null)
const coverImageType = ref(props.rom.coverImageType || null)
const error = ref('')

async function handleCoverChange(event) {
  const [file] = event.target.files || []
  if (!file) {
    return
  }

  const validation = validateCoverImageFile(file)
  if (!validation.ok) {
    error.value = validation.error
    return
  }

  coverImageBlob.value = file
  coverImageType.value = file.type
  error.value = ''
}

async function saveChanges() {
  try {
    await library.updateRomMetadata(props.rom.id, {
      customTitle: customTitle.value,
      coverImageBlob: coverImageBlob.value,
      coverImageType: coverImageType.value,
    })

    toasts.addToast('Cartridge metadata updated.', 'success')
    emit('saved')
  } catch (caughtError) {
    console.error('Unable to update cartridge metadata:', caughtError)
    error.value = 'These changes could not be saved locally.'
  }
}

async function removeCover() {
  coverImageBlob.value = null
  coverImageType.value = null

  try {
    const updatedRecord = await library.removeCoverImage(props.rom.id)
    toasts.addToast('Custom cover removed.', 'success')
    emit('updated', updatedRecord)
  } catch (caughtError) {
    console.error('Unable to remove custom cover:', caughtError)
    error.value = 'The custom cover could not be removed locally.'
  }
}
</script>

<template>
  <ModalBase @close="emit('close')">
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Edit Cartridge</h2>
        <p class="section-copy">Update the local title or custom cover image for this cartridge.</p>
      </div>
    </div>
    <div class="modal-body cartridge-form">
      <div class="field-group">
        <label for="editTitle">Cartridge Title</label>
        <input id="editTitle" v-model="customTitle" type="text" maxlength="80" />
      </div>
      <div class="field-group">
        <label for="editCover">Replace Cartridge Image</label>
        <input id="editCover" type="file" accept=".png,.jpg,.jpeg,.webp" @change="handleCoverChange" />
      </div>
      <p v-if="error" class="field-error">{{ error }}</p>
    </div>
    <div class="modal-actions">
      <PixelButton variant="ghost" @click="emit('close')">Cancel</PixelButton>
      <PixelButton variant="secondary" @click="removeCover">Remove Custom Cover</PixelButton>
      <PixelButton @click="saveChanges">Save Changes</PixelButton>
    </div>
  </ModalBase>
</template>
