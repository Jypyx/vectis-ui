<script setup lang="ts">
import { VButton, VIconButton, VInput, VInputGroup } from 'vectis-ui'
import { search } from 'vectis-ui/icons'
</script>

<template>
  <div class="column">
    <VInputGroup label="A solid button">
      <VInput type="search" aria-label="Search terms" placeholder="Search the archive" />
      <VIconButton :icon="search" variant="solid" tone="accent" label="Search" />
    </VInputGroup>

    <VInputGroup label="An outline button, in the border colour of the fields">
      <VInput type="search" aria-label="Search terms" placeholder="Search the archive" />
      <VButton variant="outline" tone="neutral" :icon-start="search">Search</VButton>
    </VInputGroup>
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
