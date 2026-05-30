<script setup>
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-scrim" @click.self="emit('close')">
      <div class="modal-panel">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
