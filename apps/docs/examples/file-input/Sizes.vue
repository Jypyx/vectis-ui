<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const rows = ref(
  (['sm', 'md', 'lg'] as const).flatMap((size) => [
    { key: size, size, compact: false, label: size, files: [] as File[] },
    { key: `${size}-compact`, size, compact: true, label: `${size}, compact`, files: [] as File[] },
  ]),
)
</script>

<template>
  <div class="column">
    <VFileInput
      v-for="row in rows"
      :key="row.key"
      v-model="row.files"
      :size="row.size"
      :compact="row.compact"
      :label="row.label"
      multiple
      display="chip"
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
