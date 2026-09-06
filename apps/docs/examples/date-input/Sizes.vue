<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const rows = ref(
  (['sm', 'md', 'lg'] as const).flatMap((size) => [
    { key: size, size, compact: false, label: size, date: '2026-06-10' as string | null },
    {
      key: `${size}-compact`,
      size,
      compact: true,
      label: `${size}, compact`,
      date: '2026-06-10' as string | null,
    },
  ]),
)
</script>

<template>
  <div class="column">
    <VDateInput
      v-for="row in rows"
      :key="row.key"
      v-model="row.date"
      :size="row.size"
      :compact="row.compact"
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
