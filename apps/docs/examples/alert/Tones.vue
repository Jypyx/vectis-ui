<script setup lang="ts">
import { VAlert } from 'vectis-ui'
</script>

<template>
  <VAlert tone="neutral">Drafts are kept for 30 days.</VAlert>
  <VAlert tone="accent">A new version is available.</VAlert>
  <VAlert tone="success">Your changes are saved.</VAlert>
  <VAlert tone="warning">You have used 90% of your storage.</VAlert>
  <VAlert tone="danger">The payment failed. Check the card details.</VAlert>
</template>
