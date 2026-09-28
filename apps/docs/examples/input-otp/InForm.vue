<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInputOTP, VTypography } from 'vectis-ui'

const code = ref('')
const submitted = ref<string | null>(null)

/* A partial code fails native validation; required also rejects an empty code. */
function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement)
  submitted.value = String(data.get('code'))
}
</script>

<template>
  <form class="column" @submit.prevent="onSubmit">
    <VInputOTP
      v-model="code"
      name="code"
      required
      :length="6"
      label="Verification code"
      hint="Submitting with empty boxes is refused"
    />
    <VButton type="submit">Verify</VButton>
    <VTypography v-if="submitted" variant="body-sm" tone="muted">
      The form sent code={{ submitted }}
    </VTypography>
  </form>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
