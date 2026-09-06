<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'

const name = ref('')
</script>

<template>
  <VInput
    v-model="name"
    label="Display name"
    hint="Shown next to everything you publish."
    placeholder="Ada Lovelace"
  />
</template>
