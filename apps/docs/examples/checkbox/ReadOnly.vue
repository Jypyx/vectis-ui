<script setup lang="ts">
import { ref } from 'vue'
import { VCheckbox } from 'vectis-ui'

const on = ref(true)
const off = ref(false)
</script>

<template>
  <div class="stack">
    <!-- Still focusable and still submitted with the form, but a click or the Space key
         changes nothing. -->
    <VCheckbox v-model="on" readonly label="Set by your organisation" />
    <VCheckbox v-model="off" readonly label="Not available on your plan" />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
