<script setup lang="ts">
import { VTimeline, VTimelineItem } from 'vectis-ui'
import { code } from 'vectis-ui/icons'
</script>

<template>
  <VTimeline orientation="horizontal" aria-label="Roadmap">
    <VTimelineItem datetime="2026-01" title="Research" tone="neutral" />
    <VTimelineItem datetime="2026-03" title="Design" tone="neutral" />
    <VTimelineItem datetime="2026-06" title="Build" :icon="code" />
    <VTimelineItem datetime="2026-09" title="Beta" />
    <VTimelineItem datetime="2026-11" title="Launch" />
  </VTimeline>
</template>
