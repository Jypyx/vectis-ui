<script setup lang="ts">
import { VTimeline, VTimelineItem } from 'vectis-ui'
</script>

<template>
  <VTimeline layout="split" aria-label="Order history">
    <VTimelineItem datetime="2026-10-06T09:15" title="Order shipped">
      The parcel left our warehouse in Lyon.
    </VTimelineItem>
    <VTimelineItem datetime="2026-10-05T16:40" title="Payment confirmed">
      Paid by card ending in 4242.
    </VTimelineItem>
    <VTimelineItem datetime="2026-10-05T16:32" title="Order placed">
      Three items, delivered to Paris.
    </VTimelineItem>
  </VTimeline>
</template>
