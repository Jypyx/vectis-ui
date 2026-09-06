<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'

const postcode = ref('')
</script>

<template>
  <VInput
    v-model="postcode"
    label="Postcode"
    hint="Five digits."
    pattern="[0-9]{5}"
    inputmode="numeric"
    title="Five digits, 75001 for instance."
  />
</template>
