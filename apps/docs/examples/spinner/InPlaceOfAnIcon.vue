<script setup lang="ts">
import { VButton, VIcon, VInput, VSpinner } from 'vectis-ui'
import { search } from 'vectis-ui/icons'
</script>

<template>
  <div class="demo">
    <!-- The spinner occupies an icon's box and paints an icon's amount of ink, so one
         stands in for the other with nothing shifting on the line. A VIcon and a
         VSpinner given the same size are interchangeable, box for box. -->
    <p><VIcon :name="search" /> Searching the archive</p>
    <p><VSpinner /> Searching the archive</p>

    <!-- Which is what lets the controls draw their own: they set the icon size and get
         a spinner the size of the glyph it replaces, with no ratio of their own. -->
    <VButton class="control" loading>Saving</VButton>
    <VInput class="control" label="Reference" model-value="INV-2481" loading />
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-4);
}
.demo p {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
  margin: 0;
}
.control {
  inline-size: 14rem;
}
</style>
