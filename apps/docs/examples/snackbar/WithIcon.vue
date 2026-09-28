<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
import { cloud_upload as cloudUpload } from 'vectis-ui/icons'
</script>

<template>
  <VButton
    variant="outline"
    tone="neutral"
    @click="snackbar({ message: 'File uploaded.', icon: cloudUpload, action: () => {} })"
  >
    Upload
  </VButton>
</template>
