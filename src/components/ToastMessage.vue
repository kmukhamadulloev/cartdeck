<script setup>
const props = defineProps({
  toast: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="toast" :class="`toast--${props.toast.tone}`">
    <div>{{ props.toast.message }}</div>
    <button class="visually-hidden" @click="emit('close')">Close toast</button>
  </div>
</template>
