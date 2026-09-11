<script setup lang="ts">
import { VButton, VIcon, VTypography } from 'vectis-ui'
import { notifications } from 'vectis-ui/icons'

const SIZES = [16, 20, 24, 32, 48]
</script>

<template>
  <div class="stack">
    <div class="row">
      <div v-for="size in SIZES" :key="size" class="cell">
        <VIcon :name="notifications" :size="size" />
        <VTypography variant="caption" tone="muted">{{ size }}</VTypography>
      </div>
    </div>

    <!-- Given no size, the icon takes the one its context imposes: a control sets one
         for everything drawn inside it, so these three need nothing of their own. -->
    <div class="row">
      <VButton :icon-start="notifications" size="sm">Small</VButton>
      <VButton :icon-start="notifications">Medium</VButton>
      <VButton :icon-start="notifications" size="lg">Large</VButton>
    </div>

    <!-- And with no context either, it falls back to 1em and follows the text it sits in. -->
    <div class="prose">
      <VTypography variant="body-sm">
        Small text, with a <VIcon :name="notifications" /> in it.
      </VTypography>
      <VTypography variant="body-lg">
        Larger text, with a <VIcon :name="notifications" /> in it.
      </VTypography>
      <VTypography variant="heading-2">A heading <VIcon :name="notifications" /></VTypography>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-7);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--vectis-space-5);
}
.cell {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
}
.prose {
  display: grid;
  gap: var(--vectis-space-2);
}
</style>
