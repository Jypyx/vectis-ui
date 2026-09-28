<script setup lang="ts">
import type { TokenValue } from '~/content/designTokens'

defineProps<{
  value: TokenValue
  /** Draws a colour swatch before the value. */
  swatch?: boolean
}>()
</script>

<template>
  <span class="vd-token-value">
    <span
      v-if="swatch"
      class="vd-token-swatch"
      aria-hidden="true"
      :style="{ backgroundColor: value.resolved }"
    />
    <code>{{ value.resolved }}</code>
  </span>
  <code v-if="value.reference" class="vd-token-reference">{{ value.reference }}</code>
</template>

<style scoped>
.vd-token-value {
  display: flex;
  align-items: baseline;
  gap: var(--vectis-space-2);
}
.vd-token-swatch {
  flex: none;
  align-self: center;
  inline-size: 1rem;
  block-size: 1rem;
  border-radius: var(--vectis-radius-interactive);
  box-shadow: inset 0 0 0 1px var(--vectis-color-border-strong);
}
code {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-code-size);
}
.vd-token-value > code {
  color: var(--vectis-color-text);
}
/* Keep token references unbroken; allow long resolved values to wrap. */
.vd-token-reference {
  display: block;
  white-space: nowrap;
  margin-block-start: var(--vectis-space-1);
  color: var(--vectis-color-text-muted);
}
</style>
