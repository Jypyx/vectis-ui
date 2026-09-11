<script setup lang="ts">
import { VSpinner } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!-- With no size the box measures 1em, so the spinner follows the text around it:
         a container that sets a font-size sizes it without being told anything, which
         is how it stays proportionate inside a button. -->
    <p class="small"><VSpinner /> Follows small text</p>
    <p class="large"><VSpinner /> Follows large text</p>

    <!-- `size` is a number of pixels, and it is the BOX the spinner occupies, not the
         diameter of the ring: the ring is drawn a little smaller inside it, at the
         proportion an icon paints its ink at. -->
    <p><VSpinner :size="32" /> 32 pixels, whatever the text does</p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-4);
}
.demo p {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin: 0;
}
.small {
  font-size: var(--vectis-text-body-sm-size);
}
.large {
  font-size: var(--vectis-text-heading-3-size);
}
</style>
