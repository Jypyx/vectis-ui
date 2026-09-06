<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const plan = ref('legacy')
</script>

<template>
  <div class="stack">
    <VRadio v-model="plan" name="plan-tier" value="free">Free</VRadio>
    <VRadio v-model="plan" name="plan-tier" value="pro" disabled>
      Pro, not available on this account
    </VRadio>
    <VRadio v-model="plan" name="plan-tier" value="legacy" disabled>
      Legacy, no longer offered
    </VRadio>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
