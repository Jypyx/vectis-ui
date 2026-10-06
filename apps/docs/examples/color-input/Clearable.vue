<script setup lang="ts">
import { ref } from 'vue'
import { VColorInput } from 'vectis-ui'

const color = ref<string | null>('#7c3aed')
</script>

<template>
  <div class="column">
    <VColorInput v-model="color" label="Highlight" placeholder="No colour" clearable />
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
