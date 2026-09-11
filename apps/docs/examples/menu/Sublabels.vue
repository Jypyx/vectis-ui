<script setup lang="ts">
import { VButton, VMenu, VMenuItem } from 'vectis-ui'
import { description, image, picture_as_pdf as pictureAsPdf } from 'vectis-ui/icons'
</script>

<template>
  <VMenu width="20rem">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Export</VButton>
    </template>

    <!-- A second line under the label: what the command does that its name does not
         already say. The row grows to hold it and the icon stays centred on both. -->
    <VMenuItem
      label="PDF"
      sublabel="Laid out for printing, one page per sheet"
      :icon-start="pictureAsPdf"
    />
    <VMenuItem label="CSV" sublabel="The raw rows, for a spreadsheet" :icon-start="description" />
    <VMenuItem label="PNG" sublabel="An image of the chart alone" :icon-start="image" />
  </VMenu>
</template>
