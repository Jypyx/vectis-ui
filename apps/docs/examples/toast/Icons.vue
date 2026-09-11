<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
import { cloud_upload as cloudUpload } from 'vectis-ui/icons'
</script>

<template>
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- Left out, the icon comes from the tone: a notification arrives unannounced, so
         it is scanned before it is read and the glyph is what carries the meaning at a
         glance. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'warning', message: 'Your session expires in 5 minutes.' })"
    >
      From the tone
    </VButton>

    <!-- Name one and it replaces the tone's, for a notification whose subject is more
         specific than its meaning. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'success', icon: cloudUpload, message: 'Backup finished.' })"
    >
      A custom icon
    </VButton>

    <!-- `false` removes it altogether, which is not the same as leaving it out: the
         card then carries no glyph at all and the text runs to the edge. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'accent', icon: false, message: 'Three new comments.' })"
    >
      No icon
    </VButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
