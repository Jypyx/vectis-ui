<script setup lang="ts">
import { VIcon, VTypography } from 'vectis-ui'
import {
  check_circle as checkCircle,
  error,
  info,
  notifications,
  schedule,
  search,
  warning,
} from 'vectis-ui/icons'

/* Six of the icons whose geometry really changes when they are filled. */
const PAIRS = [notifications, checkCircle, warning, error, info, schedule]
</script>

<template>
  <div class="stack">
    <div class="row">
      <div v-for="icon in PAIRS" :key="icon.name" class="cell">
        <span class="pair">
          <VIcon :name="icon" :size="28" />
          <VIcon :name="icon" :size="28" filled />
        </span>
        <VTypography variant="caption" tone="muted">{{ icon.name }}</VTypography>
      </div>
    </div>

    <!-- An icon whose geometry filling does not change is drawn as it always was. The
         prop is inert rather than wrong, so it can be bound without checking first. -->
    <div class="cell start">
      <span class="pair">
        <VIcon :name="search" :size="28" />
        <VIcon :name="search" :size="28" filled />
      </span>
      <VTypography variant="caption" tone="muted">search, unchanged by filling</VTypography>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-6);
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
}
.cell {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
}
.start {
  justify-items: start;
}
.pair {
  display: inline-flex;
  gap: var(--vectis-space-3);
}
</style>
