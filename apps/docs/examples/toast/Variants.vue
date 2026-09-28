<script setup lang="ts">
import { VButton, toast, type ToastTone } from 'vectis-ui'

const tones: ToastTone[] = ['neutral', 'accent', 'success', 'warning', 'danger']
</script>

<template>
  <div class="demo">
    <div class="row">
      <p class="caption">soft, the default</p>
      <div class="buttons">
        <VButton
          v-for="tone in tones"
          :key="tone"
          variant="outline"
          tone="neutral"
          @click="toast({ tone, message: `A ${tone} notification.` })"
        >
          {{ tone }}
        </VButton>
      </div>
    </div>

    <div class="row">
      <p class="caption">solid</p>
      <div class="buttons">
        <VButton
          v-for="tone in tones"
          :key="tone"
          variant="outline"
          tone="neutral"
          @click="toast({ tone, variant: 'solid', message: `A solid ${tone} notification.` })"
        >
          {{ tone }}
        </VButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: grid;
  gap: var(--vectis-space-2);
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
.caption {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
