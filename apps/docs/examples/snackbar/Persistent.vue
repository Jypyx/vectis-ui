<script setup lang="ts">
import { ref } from 'vue'
import { VButton, dismissSnackbar, snackbar } from 'vectis-ui'

const id = ref<number | null>(null)

function raise() {
  // `snackbar` hands back an id, which is what lets this bar be taken away later and
  // only this one: a stale id is ignored rather than closing whatever replaced it.
  id.value = snackbar({ message: 'Stays until you take it away.', duration: 0 })
}
</script>

<template>
  <!-- Raised into the <VSnackbar /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- A duration of 0 disarms the countdown: the bar then stays until something
         replaces it or takes it away. Reserve it for a confirmation the reader has to
         act on, and give it a way out. -->
    <VButton variant="outline" tone="neutral" @click="raise">Raise</VButton>

    <VButton variant="outline" tone="neutral" @click="dismissSnackbar(id ?? undefined)">
      Dismiss
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
