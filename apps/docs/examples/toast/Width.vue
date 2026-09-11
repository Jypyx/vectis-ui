<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'

const LONG =
  'The export finished with 3 warnings. Rows 12, 48 and 91 were skipped because their reference column was empty.'
</script>

<template>
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- Left alone the card sits between a floor and a ceiling of its own, so a short
         message is not a sliver and a long one does not stretch across the page. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'warning', title: 'Export finished', message: LONG })"
    >
      Default width
    </VButton>

    <!-- Any CSS length replaces both. It is never allowed past the width of the
         viewport, margins included, so a value too large for a phone is simply
         ignored there rather than pushing the card off the screen. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'warning', title: 'Export finished', message: LONG, width: '32rem' })"
    >
      32rem
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'accent', message: 'Saved.', width: '14rem' })"
    >
      14rem
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
