<script setup lang="ts">
import { VButton } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt } from 'vectis-ui/icons'
</script>

<template>
  <VButton href="#usage" :icon-end="arrowRightAlt">Back to usage</VButton>
  <VButton href="#usage" variant="outline" tone="neutral" disabled>Unavailable</VButton>
</template>
