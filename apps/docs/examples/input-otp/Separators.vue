<script setup lang="ts">
import { VInputOTP } from 'vectis-ui'
import { chevron_right as chevronRight, close } from 'vectis-ui/icons'
</script>

<template>
  <div class="column">
    <!-- Left alone, a literal is drawn as the character the pattern names. -->
    <VInputOTP pattern="###-###" label="Grouped code" hint="The literal, as written" />

    <!-- The icon replaces EVERY literal of the pattern, so it suits one whose
         separators are punctuation and nothing more. -->
    <VInputOTP
      pattern="###-###"
      :separator-icon="chevronRight"
      label="Grouped code with a chevron"
      hint="One icon in place of the dash"
    />

    <VInputOTP
      pattern="###.###.###"
      :separator-icon="close"
      label="Payment reference with a cross"
      hint="Both literals take the same icon"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
</style>
