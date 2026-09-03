<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
</script>

<template>
  <VAccordion variant="outlined" expand-icon="add" collapse-icon="remove">
    <VAccordionItem title="Where do these two icons come from?" default-open>
      From the icon set wired into the application, since both are given here as names.
    </VAccordionItem>
    <VAccordionItem title="And without a collapse icon?">
      The expand icon stays in place and is rotated when the section opens.
    </VAccordionItem>
  </VAccordion>
</template>
