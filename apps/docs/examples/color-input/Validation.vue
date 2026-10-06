<script setup lang="ts">
import { ref } from 'vue'
import { VColorInput } from 'vectis-ui'

const color = ref<string | null>(null)
</script>

<template>
  <div class="column">
    <VColorInput
      v-model="color"
      label="Theme colour"
      hint="Used for buttons and links."
      :error="color ? undefined : 'Choose a colour for the theme.'"
      required
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
