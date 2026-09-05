<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, VInput, VInputGroup } from 'vectis-ui'

const code = ref('+33')
const number = ref('')

const codes = [
  { value: '+33', label: '+33 France' },
  { value: '+32', label: '+32 Belgium' },
  { value: '+41', label: '+41 Switzerland' },
  { value: '+1', label: '+1 United States' },
]
</script>

<template>
  <VInputGroup label="Phone number" hint="Pick the country code, then type the rest">
    <VCombobox v-model="code" :options="codes" aria-label="Country code" class="code" />
    <VInput v-model="number" type="tel" aria-label="Number" />
  </VInputGroup>
</template>

<style scoped>
.code {
  flex: 0 0 9rem;
}
</style>
