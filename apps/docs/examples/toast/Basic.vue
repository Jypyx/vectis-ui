<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <!-- `toast()` can be called from anywhere: a component, a store, the handler that
       just saved something. What shows it is a single <VToaster /> mounted once at the
       root of the application, and only one, since the queue behind these calls has a
       single renderer. -->
  <VButton
    variant="outline"
    tone="neutral"
    @click="toast({ tone: 'success', message: 'Changes saved.' })"
  >
    Save
  </VButton>
</template>
