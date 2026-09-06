<script setup lang="ts">
import { VTextarea } from 'vectis-ui'
import { description, info } from 'vectis-ui/icons'
</script>

<template>
  <VTextarea :icon-start="description" label="Start icon" :rows="2" />
  <VTextarea :icon-end="info" label="End icon" :rows="2" />
  <VTextarea :icon-start="description" :icon-end="info" label="Both" :rows="2" />
</template>
