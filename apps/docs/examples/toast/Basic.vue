<script setup lang="ts">
import { VButton, VToaster, toast } from 'vectis-ui'
</script>

<template>
  <!-- Mount <VToaster /> once, at the root of your application. -->
  <VToaster />
  <VButton
    variant="outline"
    tone="neutral"
    @click="toast({ tone: 'success', message: 'Changes saved.' })"
  >
    Save
  </VButton>
</template>
