<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <!-- Mount one VToaster in your application to display toast() calls. -->
  <VButton
    variant="outline"
    tone="neutral"
    @click="toast({ tone: 'success', message: 'Changes saved.' })"
  >
    Save
  </VButton>
</template>
