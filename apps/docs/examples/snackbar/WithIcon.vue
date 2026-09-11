<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
import { cloud_upload as cloudUpload } from 'vectis-ui/icons'
</script>

<template>
  <!-- Raised into the <VSnackbar /> mounted once at the root of the application. -->
  <!-- An icon is opt-in, and none is deduced from the tone: a confirmation is read,
       not scanned, so the words carry it and the icon only ever adds to them. -->
  <VButton
    variant="outline"
    tone="neutral"
    @click="snackbar({ message: 'File uploaded.', icon: cloudUpload, action: () => {} })"
  >
    Upload
  </VButton>
</template>
