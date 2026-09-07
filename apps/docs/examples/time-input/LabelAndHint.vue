<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'
import { expand_more as expandMore, search } from 'vectis-ui/icons'

const start = ref<string | null>('09:15')
const meeting = ref<string | null>(null)
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="start"
      label="Start time"
      hint="Type it or pick it from the clock"
      show-picker
    />

    <VTimeInput
      v-model="meeting"
      label="Meeting"
      hint="The glyph that opens the clock is yours to choose"
      mode="picker"
      :picker-icon="expandMore"
    />

    <!-- The start icon is rendered before whatever else fills that end of the field. -->
    <VTimeInput
      v-model="start"
      label="Filter by time"
      hint="An icon at the start, a spinner at the end while something loads"
      :icon-start="search"
      loading
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
