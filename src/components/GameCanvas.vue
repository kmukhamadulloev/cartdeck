<script setup>
import { ref } from 'vue'

const canvas = ref(null)

defineExpose({
  canvas,
})
</script>

<template>
  <div class="game-canvas-frame">
    <canvas ref="canvas" class="game-canvas" width="160" height="144" />
  </div>
</template>
