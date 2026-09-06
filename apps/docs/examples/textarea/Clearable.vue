<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from 'vectis-ui'

const draft = ref('A first attempt, worth throwing away in one go.')
</script>

<template>
  <VTextarea v-model="draft" label="Draft" clearable :rows="3" />
</template>
