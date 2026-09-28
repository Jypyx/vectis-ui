<script setup lang="ts">
import { VChip } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt, notifications, schedule } from 'vectis-ui/icons'
</script>

<template>
  <VChip :icon-start="schedule" tone="accent">Start icon</VChip>
  <VChip :icon-end="arrowRightAlt" tone="accent">End icon</VChip>
  <VChip :icon-start="schedule" :icon-end="arrowRightAlt" tone="accent">Both</VChip>

  <VChip :icon-start="notifications" tone="danger" clickable aria-label="Notifications" />

  <VChip tone="success">
    <template #start><span class="dot" /></template>
    Operational
  </VChip>
</template>

<style scoped>
/* Use currentcolor so the custom dot follows the chip tone. */
.dot {
  inline-size: 0.5rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentcolor;
}
</style>
