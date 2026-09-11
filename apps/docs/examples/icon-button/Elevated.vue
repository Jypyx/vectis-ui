<script setup lang="ts">
import { VIconButton } from 'vectis-ui'
import { notifications } from 'vectis-ui/icons'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
</script>

<template>
  <div class="row">
    <VIconButton
      v-for="variant in variants"
      :key="variant"
      :icon="notifications"
      :variant="variant"
      :label="`Notifications, ${variant}`"
    />
  </div>

  <div class="row">
    <VIconButton
      v-for="variant in variants"
      :key="variant"
      :icon="notifications"
      :variant="variant"
      elevated
      :label="`Notifications, ${variant} raised`"
    />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
