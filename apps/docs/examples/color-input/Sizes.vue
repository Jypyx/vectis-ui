<script setup lang="ts">
import { ref } from 'vue'
import { VColorInput } from 'vectis-ui'

const rows = ref(
  (['sm', 'md', 'lg'] as const).map((size) => ({ size, color: '#16a34a' as string | null })),
)
</script>

<template>
  <div class="column">
    <VColorInput
      v-for="row in rows"
      :key="row.size"
      v-model="row.color"
      :size="row.size"
      :label="row.size"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
