<script setup lang="ts">
import { VChip } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt, notifications, schedule } from 'vectis-ui/icons'
</script>

<template>
  <VChip :icon-start="schedule" tone="accent">Start icon</VChip>
  <VChip :icon-end="arrowRightAlt" tone="accent">End icon</VChip>
  <VChip :icon-start="schedule" :icon-end="arrowRightAlt" tone="accent">Both</VChip>

  <!-- No label at all: the chip becomes square, and the button it already is takes the name. -->
  <VChip :icon-start="notifications" tone="danger" clickable aria-label="Notifications" />

  <VChip tone="success">
    <template #start><span class="dot" /></template>
    Operational
  </VChip>
</template>

<style scoped>
/* The #start slot takes anything, not only an icon. `currentcolor` is the chip's own text
   colour, so the dot follows the tone with nothing to declare twice. */
.dot {
  inline-size: 0.5rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentcolor;
}
</style>
