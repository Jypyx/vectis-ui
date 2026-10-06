<script setup lang="ts">
import { VTimeline, VTimelineItem } from 'vectis-ui'
</script>

<template>
  <VTimeline layout="alternate" :heading-level="3">
    <VTimelineItem datetime="2019" title="Project started">
      A handful of components for an internal tool.
    </VTimelineItem>
    <VTimelineItem datetime="2021-03" title="First public preview">
      Published on npm with twelve components.
    </VTimelineItem>
    <VTimelineItem datetime="2024-09" title="Version 1.0">
      A stable API, documented in English and French.
    </VTimelineItem>
    <VTimelineItem datetime="2026-10" title="Version 2.0">
      Design tokens, dark theme and nineteen new components.
    </VTimelineItem>
  </VTimeline>
</template>
