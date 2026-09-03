<script setup lang="ts">
import { VAvatar, VBadge } from 'vectis-ui'
</script>

<template>
  <div class="tile">
    <VBadge :count="3" overlay bordered ring-color="var(--vectis-color-surface-raised)">
      <VAvatar name="Ada Lovelace" />
    </VBadge>
  </div>

  <div class="tile tile-accent">
    <VBadge :count="3" tone="danger" overlay bordered ring-color="var(--vectis-color-accent)">
      <VAvatar name="Grace Hopper" />
    </VBadge>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  padding: var(--vectis-space-4);
  border-radius: var(--vectis-radius-surface);
  background: var(--vectis-color-surface-raised);
}
.tile-accent {
  background: var(--vectis-color-accent);
}
</style>
