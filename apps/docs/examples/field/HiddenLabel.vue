<script setup lang="ts">
import { VField, VInput } from 'vectis-ui'
import { search } from 'vectis-ui/icons'
</script>

<template>
  <VField v-slot="{ fieldProps }" label="Search" hide-label>
    <VInput v-bind="fieldProps" type="search" :icon-start="search" />
  </VField>
</template>
