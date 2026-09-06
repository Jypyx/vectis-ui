<script setup lang="ts">
import { ref } from 'vue'
import { VTimePicker, VTypography } from 'vectis-ui'

/* Each keeps its own value, so adjusting one does not disturb the others. en-US and en-GB
   are the sharp pair: the same words, and only the clock between them. */
const locales = ref<{ tag: string; caption: string; time: string | null }[]>([
  { tag: 'en-US', caption: 'en-US, twelve hours', time: '19:30' },
  { tag: 'en-GB', caption: 'en-GB, twenty-four', time: '19:30' },
  { tag: 'ja-JP', caption: 'ja-JP', time: '19:30' },
])
</script>

<template>
  <div class="row">
    <div v-for="locale in locales" :key="locale.tag" class="group">
      <VTypography variant="overline" tone="muted">{{ locale.caption }}</VTypography>
      <VTimePicker v-model="locale.time" :locale="locale.tag" />
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
