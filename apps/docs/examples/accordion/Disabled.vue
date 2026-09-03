<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
</script>

<template>
  <VAccordion variant="outlined">
    <VAccordionItem title="Personal details" default-open>
      Your name, your address and how we may contact you.
    </VAccordionItem>
    <VAccordionItem title="Payment methods" disabled>
      Available once your email address has been confirmed.
    </VAccordionItem>
    <VAccordionItem title="Delivery preferences" disabled>
      Available once a payment method has been added.
    </VAccordionItem>
    <VAccordionItem title="Privacy"> What we store, and for how long. </VAccordionItem>
  </VAccordion>
</template>
