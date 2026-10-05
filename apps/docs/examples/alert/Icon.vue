<script setup lang="ts">
import { VAlert } from 'vectis-ui'
import { cloud_upload as cloudUpload } from 'vectis-ui/icons'
</script>

<template>
  <VAlert tone="neutral" :icon="cloudUpload">Drag a file onto the page to upload it.</VAlert>
  <VAlert tone="neutral" hide-icon>Drafts are kept for 30 days.</VAlert>
</template>
