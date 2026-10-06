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

  <VAccordion variant="outline">
    <VAccordionItem title="Outline" default-open>
      A border on the page surface and rounded corners, so the group reads as a card.
    </VAccordionItem>
    <VAccordionItem title="Its own surface">
      Reach for it when the accordion has to stand apart from what surrounds it.
    </VAccordionItem>
  </VAccordion>

  <VAccordion variant="elevated">
    <VAccordionItem title="Elevated" default-open>
      A raised surface with a shadow and no border.
    </VAccordionItem>
    <VAccordionItem title="Lifted from the page">
      Reach for it when the group floats above a busy background.
    </VAccordionItem>
  </VAccordion>

  <VAccordion variant="filled">
    <VAccordionItem title="Filled" default-open>A muted surface with no border.</VAccordionItem>
    <VAccordionItem title="Fewer lines">
      Reach for it on a page that already has a lot of rules.
    </VAccordionItem>
  </VAccordion>
</template>
