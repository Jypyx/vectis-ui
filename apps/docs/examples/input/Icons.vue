<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'
import { check_circle as checkCircle, search } from 'vectis-ui/icons'

const query = ref('')
const handle = ref('ada')
</script>

<template>
  <div class="fields">
    <VInput
      v-model="query"
      label="Search"
      :icon-start="search"
      placeholder="Orders, people, files"
    />
    <VInput v-model="handle" label="Handle" :icon-end="checkCircle" hint="This handle is free." />
  </div>
</template>

<style scoped>
.fields {
  display: grid;
  gap: var(--vectis-space-4);
}
</style>
