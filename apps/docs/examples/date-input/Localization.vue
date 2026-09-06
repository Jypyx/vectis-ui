<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

/* The mask, the month names and the first day of the week all come from the tag. Each
   field keeps its own value so switching one does not disturb the others. */
const locales = ref([
  { tag: 'en-US', label: 'en-US, month first, weeks from Sunday', date: '2026-06-10' },
  { tag: 'en-GB', label: 'en-GB, day first, weeks from Monday', date: '2026-06-10' },
  { tag: 'de-DE', label: 'de-DE, dots for separators', date: '2026-06-10' },
  { tag: 'ja-JP', label: 'ja-JP, year first', date: '2026-06-10' },
])

const written = ref<string | null>('2026-06-10')
</script>

<template>
  <div class="column">
    <VDateInput
      v-for="locale in locales"
      :key="locale.tag"
      v-model="locale.date"
      :locale="locale.tag"
      :label="locale.label"
      show-picker
    />

    <VDateInput
      v-model="written"
      locale="fr-FR"
      mode="readonly"
      :display-format="{ dateStyle: 'full' }"
      label="fr-FR, written out in full"
      hint="displayFormat is an Intl option bag, and it only applies where nothing is typed"
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
