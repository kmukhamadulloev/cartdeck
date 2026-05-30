<script setup>
import CartridgeCard from '@/components/CartridgeCard.vue'
import PixelButton from '@/components/PixelButton.vue'

const props = defineProps({
  roms: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['add', 'insert', 'edit', 'delete'])
</script>

<template>
  <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    <CartridgeCard
      v-for="rom in props.roms"
      :key="rom.id"
      :rom="rom"
      @insert="emit('insert', rom)"
      @edit="emit('edit', rom)"
      @delete="emit('delete', rom)"
    />

    <article
      class="group relative h-64 overflow-hidden rounded-[2rem] border border-white/14 bg-white/8 p-5 shadow-[0_20px_50px_rgba(2,8,20,0.24)] backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/12"
    >
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(115,224,255,0.22),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))]" />
      <div class="relative flex h-full flex-col justify-between">
        <div class="space-y-4">
          <div class="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/18 bg-white/12 text-5xl text-[var(--text-primary)]">
            +
          </div>
          <div>
            <p class="mb-2 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
              Import a legally owned `.gb` or `.gbc` ROM from this device and style it in your deck.
            </p>
          </div>
        </div>
        <PixelButton @click="emit('add')">Open Import Flow</PixelButton>
      </div>
    </article>
  </section>
</template>
