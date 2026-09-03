<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
</script>

<template>
  <VAccordion>
    <VAccordionItem title="How long does delivery take?" default-open>
      Two working days in France, five anywhere else in Europe.
    </VAccordionItem>
    <VAccordionItem title="Do you ship outside Europe?">
      Yes, to twenty-eight countries. The rate is shown at checkout.
    </VAccordionItem>
    <VAccordionItem title="Can I change the address after ordering?">
      Until the parcel is handed to the carrier, from the order page.
    </VAccordionItem>
  </VAccordion>

  <VAccordion variant="outlined" multiple>
    <VAccordionItem title="What can I return?" default-open>
      Anything unworn, within thirty days of delivery.
    </VAccordionItem>
    <VAccordionItem title="Who pays for the return?" default-open>
      We do, once per order. The label is in your account.
    </VAccordionItem>
    <VAccordionItem title="When is the refund issued?">
      Within three working days of the parcel reaching the warehouse.
    </VAccordionItem>
  </VAccordion>
</template>
