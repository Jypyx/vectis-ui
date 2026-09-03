<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
</script>

<template>
  <VAccordion variant="outlined" compact>
    <VAccordionItem title="Runtime" subtitle="Node 20.11" default-open>
      The oldest version the package is tested against.
    </VAccordionItem>
    <VAccordionItem title="Package manager" subtitle="pnpm 11">
      Any manager works. The repository itself uses pnpm.
    </VAccordionItem>
    <VAccordionItem title="Module format" subtitle="ESM only">
      There is no CommonJS build, and none is planned.
    </VAccordionItem>
  </VAccordion>
</template>
