<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const rows = ref(
  (['sm', 'md', 'lg'] as const).map((size) => ({
    key: size,
    size,
    label: size,
    files: [] as File[],
  })),
)
</script>

<template>
  <div class="column">
    <VFileInput
      v-for="row in rows"
      :key="row.key"
      v-model="row.files"
      :size="row.size"
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
