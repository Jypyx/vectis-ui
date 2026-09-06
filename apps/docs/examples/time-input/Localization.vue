<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

/* Nothing here is tabulated: the clock, the mask and the wording all come from the tag.
   en-US and en-GB share every word and differ only in the clock they count on. */
const locales = ref([
  { tag: 'en-US', label: 'en-US, twelve hours', time: '19:30' },
  { tag: 'en-GB', label: 'en-GB, the same words on a 24-hour clock', time: '19:30' },
  { tag: 'fr-FR', label: 'fr-FR', time: '19:30' },
  { tag: 'ja-JP', label: 'ja-JP', time: '19:30' },
])

const forced = ref<string | null>('19:30')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-for="locale in locales"
      :key="locale.tag"
      v-model="locale.time"
      :locale="locale.tag"
      :label="locale.label"
      show-picker
    />

    <VTimeInput
      v-model="forced"
      locale="en-US"
      format="24h"
      show-picker
      label="en-US, forced onto a 24-hour clock"
      hint="format overrides what the tag would have chosen"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
