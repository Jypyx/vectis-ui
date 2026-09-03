<script setup lang="ts">
import { VButton } from 'vectis-ui'
import { arrow_right_alt as arrowRightAlt, notifications, search } from 'vectis-ui/icons'
</script>

<template>
  <VButton :icon-start="search">Search</VButton>
  <VButton :icon-end="arrowRightAlt">Next</VButton>
  <VButton :icon-start="search" :icon-end="arrowRightAlt">Search and go</VButton>
  <VButton :icon-start="notifications" variant="outline" tone="neutral">Notify me</VButton>
  <VButton :icon-start="notifications" icon-filled variant="outline" tone="neutral">
    Notifying
  </VButton>
</template>
