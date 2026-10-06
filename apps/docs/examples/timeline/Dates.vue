<script setup lang="ts">
import { VTimeline, VTimelineItem } from 'vectis-ui'
</script>

<template>
  <div class="dates">
    <VTimeline size="sm" aria-label="Activity">
      <VTimelineItem datetime="2026-10-06T11:58" time-text="Just now" title="Camille commented" />
      <VTimelineItem datetime="2026-10-06T10:00" time-text="2 hours ago" title="Sam approved" />
      <VTimelineItem datetime="2026-10-05T17:20" time-text="Yesterday" title="Alex opened it" />
    </VTimeline>
    <VTimeline
      size="sm"
      locale="fr-FR"
      :format-options="{ weekday: 'long', day: 'numeric', month: 'long' }"
      aria-label="Planning"
    >
      <VTimelineItem datetime="2026-10-12" title="Kick-off" />
      <VTimelineItem datetime="2026-10-14" title="Design review" />
      <VTimelineItem datetime="2026-10-19" title="Release" />
    </VTimeline>
  </div>
</template>

<style scoped>
.dates {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-8);
}

.dates > * {
  flex: 1 1 14rem;
}
</style>
