<script setup lang="ts">
import { VEmptyState } from 'vectis-ui'
import { notifications } from 'vectis-ui/icons'
</script>

<template>
  <VEmptyState :icon="notifications" title="You are all caught up" :heading-level="2">
    New mentions and replies show up here. Choose what you hear about in your
    <a href="#content">notification settings</a>.
  </VEmptyState>
</template>
