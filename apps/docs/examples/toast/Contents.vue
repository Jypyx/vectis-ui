<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- The message is the whole of it, and one sentence is usually enough. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'success', message: 'Changes saved.' })"
    >
      Message only
    </VButton>

    <!-- A title frames the message when the message alone would not say what it is
         about. Keep it to a few words: it is a heading, not a first sentence. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="
        toast({
          tone: 'danger',
          title: 'Upload failed',
          message: 'invoice-2481.pdf is larger than the 10 MB limit.',
        })
      "
    >
      Title and message
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
