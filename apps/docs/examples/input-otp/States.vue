<script setup lang="ts">
import { VInputOTP } from 'vectis-ui'
</script>

<template>
  <div class="column">
    <VInputOTP
      model-value="481902"
      :length="6"
      disabled
      label="Disabled code"
      hint="Out of reach entirely"
    />

    <!-- Frozen rather than out of reach: the boxes still take the focus and the code
         can be selected and copied. -->
    <VInputOTP
      model-value="481902"
      :length="6"
      readonly
      label="Read-only code"
      hint="Shown, and copyable, but not editable"
    />

    <VInputOTP
      model-value="481900"
      :length="6"
      invalid
      label="Rejected code"
      hint="That code is not the one we sent"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
</style>
