<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'

const nickname = ref('')
const headline = ref('A design system that leans on the platform')
</script>

<template>
  <div class="fields">
    <VInput
      v-model="nickname"
      label="Nickname"
      hint="The browser refuses the twenty-first character."
      counter
      :maxlength="20"
    />

    <VInput
      v-model="headline"
      label="Headline"
      hint="Type past forty and the field goes into error instead."
      counter
      :maxlength="40"
      soft-limit
    />
  </div>
</template>

<style scoped>
.fields {
  display: grid;
  gap: var(--vectis-space-4);
}
</style>
