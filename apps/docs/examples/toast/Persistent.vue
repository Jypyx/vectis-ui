<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <!-- A duration of 0 disarms the countdown: the notification then stays until it is
       dismissed. Reserve it for something the reader has to see, a failure they can
       act on, and leave the close cross on so there is a way out. -->
  <VButton
    variant="outline"
    tone="neutral"
    @click="
      toast({
        tone: 'danger',
        title: 'Connection lost',
        message: 'Your changes are kept locally until the connection comes back.',
        duration: 0,
      })
    "
  >
    Stays until dismissed
  </VButton>
</template>
