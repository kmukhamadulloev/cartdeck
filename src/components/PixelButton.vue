<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition duration-150 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary:
      'border border-white/20 bg-white/16 text-[var(--text-primary)] shadow-[0_12px_30px_rgba(3,10,22,0.18)] backdrop-blur-xl hover:bg-white/24 focus:ring-sky-300/30',
    secondary:
      'border border-white/14 bg-slate-900/12 text-[var(--text-secondary)] backdrop-blur-xl hover:bg-white/14 focus:ring-white/20',
    ghost:
      'border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-white/10 focus:ring-white/20',
    danger:
      'border border-rose-300/20 bg-rose-500/22 text-white backdrop-blur-xl hover:bg-rose-500/28 focus:ring-rose-300/30',
  }

  return [base, variants[props.variant], props.block ? 'w-full' : '']
})
</script>

<template>
  <button :type="props.type" :class="classes" :disabled="props.disabled">
    <slot />
  </button>
</template>
