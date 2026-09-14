<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const delivery = ref('standard')
</script>

<template>
  <div class="stack">
    <VRadio
      v-model="delivery"
      name="delivery"
      value="standard"
      label="Standard"
      hint="Three to five working days."
    />
    <VRadio
      v-model="delivery"
      name="delivery"
      value="express"
      label="Express"
      hint="Next working day, when ordered before noon."
    />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
