<script setup lang="ts">
import { ref } from 'vue'
import { VCheckbox } from 'vectis-ui'

const digest = ref(true)
const mentions = ref(false)
</script>

<template>
  <div class="stack">
    <!-- The hint is tied to the box through aria-describedby, and it sits outside the
         label, so a screen reader reads it after the name rather than as part of it. -->
    <VCheckbox v-model="digest" label="Weekly digest" hint="A summary of the week, every Monday." />
    <VCheckbox v-model="mentions" label="Mentions" hint="Only when someone names you." />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
