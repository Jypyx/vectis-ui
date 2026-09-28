<script setup lang="ts">
import { VButton, VMenu, VMenuItem, VMenuSeparator } from 'vectis-ui'
import {
  arrow_right_alt as arrowRightAlt,
  attach_file as attachFile,
  close,
  cloud_upload as cloudUpload,
  description,
  info,
  schedule,
} from 'vectis-ui/icons'
</script>

<template>
  <VMenu>
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">Document</VButton>
    </template>

    <VMenuItem label="Open" :icon-start="description" />
    <VMenuItem label="Upload a new version" :icon-start="cloudUpload" />
    <VMenuItem label="Attach a file" :icon-start="attachFile" />

    <VMenuSeparator />

    <VMenuItem label="Documentation" href="#usage" :icon-start="info" :icon-end="arrowRightAlt" />

    <VMenuSeparator />

    <VMenuItem label="Remind me later" :icon-start="schedule" disabled />

    <VMenuItem label="Delete" :icon-start="close" tone="danger" />
  </VMenu>
</template>
