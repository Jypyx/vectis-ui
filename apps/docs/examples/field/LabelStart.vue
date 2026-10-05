<script setup lang="ts">
import { VField, VInput, VTextarea } from 'vectis-ui'
</script>

<template>
  <div class="form">
    <VField v-slot="{ fieldProps }" label="Full name" label-position="start" required>
      <VInput v-bind="fieldProps" autocomplete="name" />
    </VField>
    <VField v-slot="{ fieldProps }" label="About you" label-position="start">
      <VTextarea v-bind="fieldProps" />
    </VField>
  </div>
</template>

<style scoped>
.form {
  display: grid;
  flex: 1;
  gap: var(--vectis-space-4);
}
</style>
