<script setup lang="ts">
import { VField, VInput } from 'vectis-ui'
</script>

<template>
  <VField v-slot="{ fieldProps }" label="Expiry date" hint="As printed on the card." group>
    <div v-bind="fieldProps" role="group" class="expiry">
      <VInput aria-label="Month" inputmode="numeric" />
      <VInput aria-label="Year" inputmode="numeric" />
    </div>
  </VField>
</template>

<style scoped>
.expiry {
  display: flex;
  gap: var(--vectis-space-2);
  max-inline-size: 15rem;
}
</style>
