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

    <!-- `href` turns the row into a real link, so it can be middle-clicked and its
         address copied. -->
    <VMenuItem label="Documentation" href="#usage" :icon-start="info" :icon-end="arrowRightAlt" />

    <VMenuSeparator />

    <!-- A disabled row stops responding and the arrow keys step over it. -->
    <VMenuItem label="Remind me later" :icon-start="schedule" disabled />

    <!-- A row is an action, so what it means is a tone, the same word on the same prop
         as a button. There is no accent: a menu has no primary command. -->
    <VMenuItem label="Delete" :icon-start="close" tone="danger" />
  </VMenu>
</template>
