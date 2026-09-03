<script setup lang="ts">
import { VAccordion, VAccordionItem } from 'vectis-ui'
import { description, notifications, schedule } from 'vectis-ui/icons'
</script>

<template>
  <VAccordion variant="outlined">
    <VAccordionItem
      :icon-start="notifications"
      title="Notifications"
      subtitle="Email and in-app alerts"
      default-open
    >
      Choose which events reach you, and where.
    </VAccordionItem>
    <VAccordionItem
      :icon-start="schedule"
      title="Availability"
      subtitle="Working hours and time zone"
    >
      The hours during which your team can be reached.
    </VAccordionItem>
    <VAccordionItem :icon-start="description" title="Documents" subtitle="Contracts and invoices">
      Everything signed or billed on this account.
    </VAccordionItem>
  </VAccordion>
</template>
