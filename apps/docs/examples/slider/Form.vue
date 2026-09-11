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
    <!-- The root is a layout box, so `name`, `id` and the aria-* are redirected onto
         the real range input: left on the wrapper a name would submit nothing and a
         label would point at a div. Here the name reaches the form and the label
         reaches the thumb, which is why the `label` prop is left out: it sets an
         aria-label, and that would win over the visible label. -->
    <label class="field-label" for="volume">Volume</label>
    <VSlider id="volume" v-model="volume" name="volume" />

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
.field-label {
  font-size: var(--vectis-text-label-size);
  font-weight: var(--vectis-text-label-weight);
}
.log {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
