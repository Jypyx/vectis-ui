<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from 'vectis-ui'

const email = ref('')
</script>

<template>
  <VInput v-model="email" label="Email" placeholder="you@example.com" />
</template>
