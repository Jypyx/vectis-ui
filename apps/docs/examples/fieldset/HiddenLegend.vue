<script setup lang="ts">
import { VCheckbox, VFieldset } from 'vectis-ui'
</script>

<template>
  <VFieldset legend="Notifications" hide-legend orientation="horizontal">
    <VCheckbox label="Email" />
    <VCheckbox label="Text message" />
  </VFieldset>
</template>
