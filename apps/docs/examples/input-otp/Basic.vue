<script setup lang="ts">
import { ref } from 'vue'
import { VInputOTP } from 'vectis-ui'

const code = ref('')
</script>

<template>
  <VInputOTP v-model="code" :length="6" label="Verification code" />
</template>
