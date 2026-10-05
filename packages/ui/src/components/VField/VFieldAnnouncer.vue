<script setup lang="ts">
// @a11y
/**
 * Announces the error message of a field, for VField, VFieldset and every control with an
 * `error` prop. The visible message, which takes the place of the hint, is referenced by the
 * control's `aria-describedby` and read whenever the control is focused; this region announces
 * it when it appears or changes. It stays mounted at the root of the control, because a live
 * region inserted together with its text is not announced reliably. The first message, rendered
 * with the page, is not announced.
 */

import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  /** The error message. Empty or absent, there is nothing to announce. */
  text?: string
}>()

const announced = ref('')

watch(
  () => props.text,
  async (text) => {
    // Cleared first, so that the same message raised twice in a row is announced twice.
    announced.value = ''
    if (!text) return
    await nextTick()
    announced.value = text
  },
)
</script>

<template>
  <span class="v-visually-hidden" aria-live="polite">{{ announced }}</span>
</template>
