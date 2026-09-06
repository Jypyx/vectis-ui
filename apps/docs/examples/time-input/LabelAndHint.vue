<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'
import { expand_more as expandMore } from 'vectis-ui/icons'

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
      hint="Read-only, and the glyph that opens the clock is yours to choose"
      mode="readonly"
      :picker-icon="expandMore"
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
