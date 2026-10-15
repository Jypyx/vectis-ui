<script setup lang="ts">
import { VTextarea } from 'vectis-ui'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="grid">
    <VTextarea v-for="size in sizes" :key="size" :size="size" :label="size" :rows="2" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--vectis-space-4);
}
</style>
