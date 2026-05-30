<script setup>
import ModalBase from '@/components/ModalBase.vue'
import PixelButton from '@/components/PixelButton.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  tone: {
    type: String,
    default: 'danger',
  },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <ModalBase @close="emit('close')">
    <div class="modal-header">
      <div>
        <h2 class="modal-title">{{ props.title }}</h2>
        <p class="section-copy">{{ props.message }}</p>
      </div>
    </div>
    <div class="modal-actions">
      <PixelButton variant="ghost" @click="emit('close')">Cancel</PixelButton>
      <PixelButton :variant="props.tone" @click="emit('confirm')">{{ props.confirmLabel }}</PixelButton>
    </div>
  </ModalBase>
</template>
