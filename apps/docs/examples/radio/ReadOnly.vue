<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const plan = ref('standard')
</script>

<template>
  <div class="stack">
    <!-- Arrow keys move focus without changing the selection. -->
    <VRadio v-model="plan" name="locked-plan" value="free" readonly label="Free" />
    <VRadio v-model="plan" name="locked-plan" value="standard" readonly label="Standard" />
    <VRadio v-model="plan" name="locked-plan" value="pro" readonly label="Pro" />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
