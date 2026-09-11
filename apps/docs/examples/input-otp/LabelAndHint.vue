<script setup lang="ts">
import { ref } from 'vue'
import { VInputOTP, VTypography } from 'vectis-ui'

const code = ref('')
</script>

<template>
  <div class="column">
    <!-- `label` names the row for assistive technology and renders nothing: the
         instructions above are the page's own, written where they read best. -->
    <VTypography as="h3" variant="heading-4">Check your phone</VTypography>
    <VTypography tone="muted">We sent a six digit code to +33 6 12 34 56 78.</VTypography>

    <VInputOTP
      v-model="code"
      :length="6"
      label="Verification code"
      hint="The code lasts ten minutes. Ask for another one if it has expired."
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
