<script setup lang="ts">
import { VAvatar, VTimeline, VTimelineItem } from 'vectis-ui'
import { check_circle, code, error } from 'vectis-ui/icons'
</script>

<template>
  <VTimeline aria-label="Deployments">
    <VTimelineItem
      datetime="2026-10-06T10:02"
      title="Deployed to production"
      tone="success"
      :icon="check_circle"
    >
      Release 2.0.1 is live.
    </VTimelineItem>
    <VTimelineItem datetime="2026-10-06T09:48" title="Tests retried" tone="warning">
      Two browser tests passed on the second attempt.
    </VTimelineItem>
    <VTimelineItem datetime="2026-10-06T09:30" title="Build failed" tone="danger" :icon="error">
      Type error in the date input.
    </VTimelineItem>
    <VTimelineItem datetime="2026-10-06T09:20" title="Camille approved the changes">
      <template #marker>
        <VAvatar name="Camille Martin" size="sm" />
      </template>
    </VTimelineItem>
    <VTimelineItem datetime="2026-10-06T09:12" title="Commit pushed" tone="neutral" :icon="code" />
  </VTimeline>
</template>
