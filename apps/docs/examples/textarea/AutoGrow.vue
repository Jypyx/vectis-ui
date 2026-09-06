<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from 'vectis-ui'

const text =
  'Both fields start two rows tall.\nAdd a line to each of them.\nThe first one scrolls, the second one gets taller.'

const fixed = ref(text)
const growing = ref(text)
</script>

<template>
  <VTextarea v-model="fixed" label="Fixed height" :rows="2" />
  <VTextarea v-model="growing" label="Grows with the text" :rows="2" auto-grow />
</template>
