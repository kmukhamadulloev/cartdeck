<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { createObjectUrl, revokeObjectUrl } from '@/utils/imageUtils'
import { formatDate } from '@/utils/formatUtils'
import { getDisplayTitle } from '@/utils/romUtils'

const props = defineProps({
  rom: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['insert', 'edit', 'delete'])

const coverUrl = ref(null)

watch(
  () => props.rom.coverImageBlob,
  (blob) => {
    revokeObjectUrl(coverUrl.value)
    coverUrl.value = createObjectUrl(blob)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  revokeObjectUrl(coverUrl.value)
})

const title = computed(() => getDisplayTitle(props.rom))
</script>

<template>
  <article
    class="group relative h-64 cursor-pointer overflow-hidden rounded-[2rem] border border-white/12 bg-slate-900/20 shadow-[0_25px_55px_rgba(2,8,20,0.28)]"
    @click="emit('insert', props.rom)"
  >
    <div class="absolute inset-0">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="`${title} cartridge cover`"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(115,224,255,0.3),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02)),linear-gradient(135deg,_#10203f,_#18284f_55%,_#0d1630)] p-6 text-center text-2xl font-semibold tracking-tight text-white"
      >
        {{ title }}
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-900/28 to-slate-950/10 transition duration-300 group-hover:backdrop-blur-md" />
    </div>

    <div
      class="absolute inset-x-4 bottom-4 translate-y-6 rounded-[1.75rem] border border-white/16 bg-white/10 p-4 opacity-0 shadow-[0_18px_45px_rgba(2,8,20,0.34)] backdrop-blur-2xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
    >
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-xl font-semibold tracking-tight text-white">{{ title }}</h3>
            <p class="mt-1 text-sm text-white/70">Last run: {{ formatDate(props.rom.lastPlayedAt) }}</p>
          </div>
          <span class="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/85">
            {{ props.rom.typeLabel || props.rom.extension.toUpperCase() }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-medium uppercase tracking-[0.22em] text-white/55">Tap card to launch</span>
          <div class="flex gap-2">
            <button
              class="rounded-full border border-white/16 bg-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/18"
              @click.stop="emit('edit', props.rom)"
            >
              Edit
            </button>
            <button
              class="rounded-full border border-rose-300/22 bg-rose-500/18 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500/28"
              @click.stop="emit('delete', props.rom)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
