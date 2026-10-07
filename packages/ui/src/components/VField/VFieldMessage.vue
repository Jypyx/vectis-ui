<script setup lang="ts">
// @a11y
/**
 * The line under a control: the error message, or the hint when there is none, so that raising
 * the error does not grow the field. Shared by VField, VFieldset and the choice controls, whose
 * layouts differ but whose message does not. The ids are the owner's, which also references them.
 */

import VTypography from '../VTypography/VTypography.vue'

defineProps<{
  /** A line of help. */
  hint?: string
  /** What is wrong with the value, shown in place of the hint. */
  error?: string
  hintId: string
  errorId: string
}>()
</script>

<template>
  <span v-if="error" :id="errorId" class="v-field-error">{{ error }}</span>
  <VTypography v-else-if="hint" :id="hintId" variant="caption" tone="muted" class="v-field-hint">
    {{ hint }}
  </VTypography>
</template>
