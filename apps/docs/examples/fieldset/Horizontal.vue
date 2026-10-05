<script setup lang="ts">
import { VCheckbox, VFieldset } from 'vectis-ui'
</script>

<template>
  <VFieldset legend="Notifications" orientation="horizontal">
    <VCheckbox label="Email" />
    <VCheckbox label="Text message" />
    <VCheckbox label="Push" />
  </VFieldset>
</template>
