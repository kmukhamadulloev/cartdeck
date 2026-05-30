<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  dark: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const root = ref(null)

const selectedOption = computed(
  () => props.options.find((option) => option.value === props.modelValue) ?? props.options[0],
)

const fieldClass = computed(() =>
  props.dark
    ? 'border-white/10 bg-white/[0.04] text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
    : 'border-slate-200 bg-white text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
)

const labelClass = computed(() => (props.dark ? 'text-slate-400' : 'text-slate-500'))

const menuClass = computed(() =>
  props.dark
    ? 'border-white/10 bg-slate-900 text-slate-50 shadow-[0_18px_40px_rgba(2,6,23,0.5)]'
    : 'border-slate-200 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
)

const optionBaseClass = computed(() =>
  props.dark ? 'text-slate-100 hover:bg-white/[0.06]' : 'text-slate-800 hover:bg-slate-100',
)

const optionSelectedClass = computed(() =>
  props.dark ? 'bg-sky-500/14 text-sky-200' : 'bg-sky-50 text-sky-700',
)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function selectOption(value) {
  emit('update:modelValue', value)
  close()
}

function onDocumentPointerDown(event) {
  if (root.value && !root.value.contains(event.target)) {
    close()
  }
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div ref="root" class="relative" :class="{ 'z-30': isOpen }">
    <button
      type="button"
      class="block w-full border px-3 py-3 text-left transition"
      :class="fieldClass"
      :aria-expanded="isOpen"
      @click="toggleOpen"
    >
      <span class="mb-1 block text-xs font-medium uppercase tracking-[0.18em]" :class="labelClass">
        {{ label }}
      </span>
      <span class="flex items-center justify-between gap-3">
        <span class="text-base font-medium">{{ selectedOption.label }}</span>
        <FontAwesomeIcon
          icon="fa-solid fa-chevron-down"
          class="text-sm transition"
          :class="[labelClass, isOpen ? 'rotate-180' : 'rotate-0']"
        />
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div v-if="isOpen" class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 border p-1" :class="menuClass">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium transition"
          :class="[
            optionBaseClass,
            option.value === modelValue ? optionSelectedClass : '',
          ]"
          @click="selectOption(option.value)"
        >
          <span>{{ option.label }}</span>
          <FontAwesomeIcon
            v-if="option.value === modelValue"
            icon="fa-solid fa-check"
            class="text-xs"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>
