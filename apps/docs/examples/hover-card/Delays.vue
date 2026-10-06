<script setup lang="ts">
import { VHoverCard, VLink, VTypography } from 'vectis-ui'

const cards = [
  { label: 'Default (500 / 300 ms)', openDelay: 500, closeDelay: 300 },
  { label: 'Quick (150 / 100 ms)', openDelay: 150, closeDelay: 100 },
]
</script>

<template>
  <div class="row">
    <VHoverCard
      v-for="card in cards"
      :key="card.label"
      :open-delay="card.openDelay"
      :close-delay="card.closeDelay"
    >
      <template #default="{ triggerProps }">
        <VLink href="#vectis" v-bind="triggerProps">{{ card.label }}</VLink>
      </template>
      <template #content>
        <VTypography variant="subtitle">vectis-ui</VTypography>
        <VTypography variant="body-sm" tone="muted">
          A Vue 3 component library built for modern browsers.
        </VTypography>
      </template>
    </VHoverCard>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
}
</style>
