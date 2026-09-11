<script setup lang="ts">
import { VTypography, type TypographyVariant } from 'vectis-ui'

const variants: TypographyVariant[] = [
  'display',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'subtitle',
  'body-xl',
  'body-lg',
  'body-md',
  'body-sm',
  'label',
  'caption',
  'overline',
  'code',
]
</script>

<template>
  <!-- Each role is a complete recipe: size, weight, line height, and where the role
       calls for it the letter spacing and a monospaced family. Nothing here is set one
       property at a time. -->
  <div class="table">
    <template v-for="variant in variants" :key="variant">
      <VTypography variant="code" as="span" tone="muted">{{ variant }}</VTypography>
      <VTypography :variant="variant" as="p">Pack my box with five dozen jugs.</VTypography>
    </template>
  </div>
</template>

<style scoped>
.table {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: baseline;
  gap: var(--vectis-space-3) var(--vectis-space-5);
}
</style>
