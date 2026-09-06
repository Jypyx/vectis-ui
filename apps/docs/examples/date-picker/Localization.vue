<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker, VTypography } from 'vectis-ui'

/* Each keeps its own value, so switching one does not disturb the others. */
const locales = ref([
  { tag: 'en-US', caption: 'en-US, weeks from Sunday', date: '2026-06-10' },
  { tag: 'fr-FR', caption: 'fr-FR, weeks from Monday', date: '2026-06-10' },
  { tag: 'ja-JP', caption: 'ja-JP', date: '2026-06-10' },
])

const forced = ref('2026-06-10')
</script>

<template>
  <div class="row">
    <div v-for="locale in locales" :key="locale.tag" class="group">
      <VTypography variant="overline" tone="muted">{{ locale.caption }}</VTypography>
      <VDatePicker v-model="locale.date" :locale="locale.tag" />
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">en-US, weeks forced to Monday</VTypography>
      <VDatePicker v-model="forced" locale="en-US" :first-day-of-week="1" />
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--vectis-space-6);
}
.group {
  display: grid;
  gap: var(--vectis-space-2);
}
</style>
