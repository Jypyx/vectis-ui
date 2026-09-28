<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
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
