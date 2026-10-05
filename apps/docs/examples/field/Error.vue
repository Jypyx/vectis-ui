<script setup lang="ts">
import { computed, ref } from 'vue'
import { VField, VInput } from 'vectis-ui'

const email = ref('')
const touched = ref(false)

const error = computed(() =>
  touched.value && !email.value.includes('@')
    ? 'Enter an email address that contains an @.'
    : undefined,
)
</script>

<template>
  <VField
    v-slot="{ fieldProps }"
    label="Email"
    hint="Leave the field to check it."
    :error="error"
    required
  >
    <VInput v-bind="fieldProps" v-model="email" @blur="touched = true" />
  </VField>
</template>
