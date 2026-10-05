<script setup lang="ts">
import { VField } from 'vectis-ui'
</script>

<template>
  <VField v-slot="{ fieldProps }" label="Country">
    <!-- The label's `for` matches the id inside fieldProps, which the rule cannot follow. -->
    <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
    <select v-bind="fieldProps">
      <option>France</option>
      <option>Belgium</option>
      <option>Canada</option>
    </select>
  </VField>
</template>
