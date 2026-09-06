<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'

const handle = ref('ada')
const query = ref('metro')
</script>

<template>
  <div class="fields">
    <VInput label="Disabled" model-value="Not editable" disabled />
    <VInput label="Read-only" model-value="ada@example.com" readonly />
    <VInput v-model="handle" label="Invalid" invalid hint="That handle is already taken." />
    <VInput v-model="query" label="Loading" loading />
  </div>
</template>

<style scoped>
.fields {
  display: grid;
  gap: var(--vectis-space-4);
}
</style>
