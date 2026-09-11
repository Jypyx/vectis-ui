<script setup lang="ts">
import { VIconButton } from 'vectis-ui'
import { notifications } from 'vectis-ui/icons'

const variants = ['solid', 'soft', 'outline', 'ghost'] as const
const tones = ['accent', 'neutral', 'danger'] as const
</script>

<template>
  <div v-for="tone in tones" :key="tone" class="row">
    <VIconButton
      v-for="variant in variants"
      :key="variant"
      :icon="notifications"
      :variant="variant"
      :tone="tone"
      :label="`Notifications, ${variant} ${tone}`"
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
