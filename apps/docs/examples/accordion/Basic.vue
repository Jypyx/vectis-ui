<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
</script>

<template>
  <VAccordion>
    <VAccordionItem title="Does it work with Nuxt?" default-open>
      Yes. The package is SSR-safe and ships as ESM.
    </VAccordionItem>
    <VAccordionItem title="Is there a Tailwind preset?">
      No. The tokens are custom properties, which any framework can read.
    </VAccordionItem>
  </VAccordion>
</template>
