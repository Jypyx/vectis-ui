<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
</script>

<template>
  <VAccordion>
    <VAccordionItem title="Flat, the default" default-open>
      Nothing is drawn around the group, which lets it sit on the surface behind it.
    </VAccordionItem>
    <VAccordionItem title="No background, no border">
      Reach for it when the page already provides the frame.
    </VAccordionItem>
  </VAccordion>

  <VAccordion variant="outlined">
    <VAccordionItem title="Outlined" default-open>
      A raised background, a border and rounded corners, so the group reads as a card.
    </VAccordionItem>
    <VAccordionItem title="Its own surface">
      Reach for it when the accordion has to stand apart from what surrounds it.
    </VAccordionItem>
  </VAccordion>
</template>
