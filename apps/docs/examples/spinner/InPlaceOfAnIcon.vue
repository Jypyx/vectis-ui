<script setup lang="ts">
import { VButton, VIcon, VInput, VSpinner } from 'vectis-ui'
import { search } from 'vectis-ui/icons'
</script>

<template>
  <div class="demo">
    <p><VIcon :name="search" /> Searching the archive</p>
    <p><VSpinner /> Searching the archive</p>

    <VButton class="control" loading>Saving</VButton>
    <VInput class="control" label="Reference" model-value="INV-2481" loading />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-4);
}
.demo p {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin: 0;
}
.control {
  inline-size: 14rem;
}
</style>
