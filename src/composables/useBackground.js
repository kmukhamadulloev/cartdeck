import { computed, ref, watch } from 'vue'

import { useSettings } from '@/composables/useSettings'
import { createObjectUrl, revokeObjectUrl } from '@/utils/imageUtils'

const customUrl = ref(null)

export function useBackground() {
  const settings = useSettings()

  watch(
    settings.customBackgroundBlob,
    (blob) => {
      revokeObjectUrl(customUrl.value)
      customUrl.value = createObjectUrl(blob)
    },
    { immediate: true },
  )

  const backgroundClass = computed(() => `background-${settings.selectedBackgroundKey.value}`)
  const backgroundStyle = computed(() =>
    customUrl.value
      ? {
          '--custom-background-image': `url("${customUrl.value}")`,
        }
      : {},
  )

  return {
    backgroundClass,
    backgroundStyle,
  }
}
