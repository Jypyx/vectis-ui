<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <VButton variant="outline" tone="neutral" @click="snackbar({ message: 'Settings saved.' })">
    Save
  </VButton>
</template>
