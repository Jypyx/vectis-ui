<script setup lang="ts">
import { VButton, VSeparator, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="stack">
    <VButton variant="outline" tone="neutral">Continue with a passkey</VButton>

    <!-- The component takes no content: a divider carrying a word is a heading with a
         rule on either side of it, so it is built rather than configured. The rules
         are told to grow, the base one being `flex: none`; a consumer rule is
         unlayered, so it wins over that. -->
    <div class="divider">
      <VSeparator class="line" />
      <VTypography variant="overline" tone="muted">or</VTypography>
      <VSeparator class="line" />
    </div>

    <VButton>Continue with an email address</VButton>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-4);
  max-inline-size: 22rem;
}
.divider {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-3);
}
.line {
  flex: 1;
}
</style>
