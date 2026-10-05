<script setup lang="ts">
import { ref } from 'vue'
import { VField, VInput } from 'vectis-ui'

const email = ref('')
</script>

<template>
  <VField v-slot="{ fieldProps }" label="Email" hint="We send the receipt to this address.">
    <VInput v-bind="fieldProps" v-model="email" type="email" />
  </VField>
</template>
