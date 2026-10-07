<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VSlider } from 'vectis-ui'

const volume = ref(40)
const submitted = ref<string | null>(null)

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement)
  submitted.value = [...data].map(([key, value]) => `${key}=${value}`).join(', ')
}
</script>

<template>
  <form class="demo" @submit.prevent="onSubmit">
    <VSlider v-model="volume" name="volume" label="Volume" />

    <VButton class="submit" type="submit" size="sm" variant="outline" tone="neutral">
      Submit
    </VButton>
    <p class="log">{{ submitted ?? 'Nothing submitted yet' }}</p>
  </form>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
  inline-size: 20rem;
}
.submit {
  justify-self: start;
}
.log {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
