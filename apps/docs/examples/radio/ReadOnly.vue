<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const plan = ref('standard')
</script>

<template>
  <div class="stack">
    <!-- Set on every button of the group. The arrow keys still move the focus, and the
         selection stays where it is. -->
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
