<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const rows = ref(
  (['sm', 'md', 'lg'] as const).map((size) => ({
    key: size,
    size,
    label: size,
    time: '09:15' as string | null,
  })),
)
</script>

<template>
  <div class="column">
    <VTimeInput
      v-for="row in rows"
      :key="row.key"
      v-model="row.time"
      :size="row.size"
      :label="row.label"
      show-picker
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
